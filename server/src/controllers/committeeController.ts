import { Request, Response, NextFunction } from 'express';
import { CommitteeMember } from '../models/CommitteeMember';
import { ApiError, sendResponse } from '../utils/apiResponse';
import { ImageService } from '../services/imageService';
import { logger } from '../utils/logger';

export class CommitteeController {
  /**
   * Get public committee members
   * GET /api/committee
   */
  public static async getCommittee(_req: Request, res: Response, next: NextFunction) {
    try {
      const members = await CommitteeMember.find({ isActive: true })
        .sort({ displayOrder: 1, createdAt: 1 })
        .lean();

      return sendResponse(res, 200, 'समिति सदस्यों की सूची', members);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Get all committee members (including inactive)
   * GET /api/committee/all
   */
  public static async getAllMembersAdmin(_req: Request, res: Response, next: NextFunction) {
    try {
      const members = await CommitteeMember.find()
        .sort({ displayOrder: 1, createdAt: 1 })
        .lean();

      return sendResponse(res, 200, 'सभी समिति सदस्य', members);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Add new committee member
   * POST /api/committee (multipart: photo, name, designation, bio, displayOrder, isActive)
   */
  public static async createMember(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file && !req.body.photoUrl) {
        throw new ApiError(400, 'कृपया सदस्य का फोटो अपलोड करें');
      }

      const { name, designation, bio, displayOrder, isActive } = req.body;

      let photoUrl = req.body.photoUrl;
      if (req.file) {
        photoUrl = await ImageService.processPortrait(req.file.buffer, 'committee');
      }

      const member = await CommitteeMember.create({
        name,
        photoUrl,
        designation,
        bio: bio || '',
        displayOrder: displayOrder ? parseInt(displayOrder, 10) : 0,
        isActive: isActive !== undefined ? String(isActive) === 'true' : true,
      });

      logger.info(`Committee member created: ${member.name} (${member.designation})`);

      return sendResponse(res, 201, 'समिति सदस्य सफलतापूर्वक जोड़ा गया', member);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Update committee member
   * PATCH /api/committee/:id
   */
  public static async updateMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const member = await CommitteeMember.findById(id);
      if (!member) {
        throw new ApiError(404, 'सदस्य नहीं मिला');
      }

      const { name, designation, bio, displayOrder, isActive } = req.body;

      if (req.file) {
        // Delete old photo if it was local
        if (member.photoUrl) {
          await ImageService.deleteImageFiles([member.photoUrl]);
        }
        member.photoUrl = await ImageService.processPortrait(req.file.buffer, 'committee');
      }

      if (name !== undefined) member.name = name;
      if (designation !== undefined) member.designation = designation;
      if (bio !== undefined) member.bio = bio;
      if (displayOrder !== undefined) member.displayOrder = parseInt(displayOrder, 10);
      if (isActive !== undefined) member.isActive = String(isActive) === 'true';

      await member.save();

      return sendResponse(res, 200, 'सदस्य विवरण सफलतापूर्वक अपडेट किया गया', member);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Delete committee member
   * DELETE /api/committee/:id
   */
  public static async deleteMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const member = await CommitteeMember.findById(id);
      if (!member) {
        throw new ApiError(404, 'सदस्य नहीं मिला');
      }

      if (member.photoUrl) {
        await ImageService.deleteImageFiles([member.photoUrl]);
      }

      await CommitteeMember.findByIdAndDelete(id);

      return sendResponse(res, 200, 'समिति सदस्य को सफलतापूर्वक हटा दिया गया');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Reorder committee members
   * PATCH /api/committee/reorder
   */
  public static async reorderMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const { orders } = req.body as { orders: { id: string; displayOrder: number }[] };

      if (!Array.isArray(orders)) {
        throw new ApiError(400, 'अमान्य क्रम सूची');
      }

      const bulkOps = orders.map((item) => ({
        updateOne: {
          filter: { _id: item.id },
          update: { $set: { displayOrder: item.displayOrder } },
        },
      }));

      await CommitteeMember.bulkWrite(bulkOps);

      return sendResponse(res, 200, 'क्रम सफलतापूर्वक अद्यतित किया गया');
    } catch (error) {
      next(error);
    }
  }
}
