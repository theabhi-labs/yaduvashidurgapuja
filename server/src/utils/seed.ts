import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { User } from '../models/User';
import { Memory } from '../models/Memory';
import { CommitteeMember } from '../models/CommitteeMember';
import { Report } from '../models/Report';
import { VisitorSession } from '../models/VisitorSession';
import { ENV } from '../config/env';
import { ImageService } from '../services/imageService';
import { logger } from './logger';

// Helper to create an artistic SVG placeholder rendered to WebP
const createSampleWebpImage = async (
  filepath: string,
  width: number,
  height: number,
  title: string,
  subtitle: string,
  bgColor: string = '#7A1820',
  accentColor: string = '#B88A3B'
) => {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="grad" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
          <stop offset="0%" stop-color="#8E1C25" />
          <stop offset="100%" stop-color="${bgColor}" />
        </radialGradient>
        <pattern id="motif" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="1.5" fill="${accentColor}" opacity="0.15" />
        </pattern>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)" />
      <rect width="${width}" height="${height}" fill="url(#motif)" />
      
      <!-- Auspicious Border -->
      <rect x="20" y="20" width="${width - 40}" height="${height - 40}" fill="none" stroke="${accentColor}" stroke-width="2" stroke-opacity="0.4" rx="10" />
      <rect x="28" y="28" width="${width - 56}" height="${height - 56}" fill="none" stroke="${accentColor}" stroke-width="1" stroke-opacity="0.2" rx="6" />

      <!-- Center Trishul Motif -->
      <g transform="translate(${width / 2 - 30}, ${height / 2 - 90}) scale(0.6)">
        <path d="M50 15V85M50 15C42 28 30 38 20 42C28 48 38 48 50 48C62 48 72 48 80 42C70 38 58 28 50 15Z" stroke="${accentColor}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <circle cx="50" cy="52" r="8" fill="${accentColor}"/>
        <path d="M35 70C35 78 42 82 50 82C58 82 65 78 65 70H35Z" fill="${accentColor}"/>
      </g>

      <!-- Text -->
      <text x="${width / 2}" y="${height / 2 + 30}" font-family="'Noto Serif Devanagari', 'Georgia', serif" font-size="${Math.min(32, width / 20)}" font-weight="bold" fill="#F4ECD0" text-anchor="middle">
        ${title}
      </text>
      <text x="${width / 2}" y="${height / 2 + 70}" font-family="'Noto Sans Devanagari', sans-serif" font-size="${Math.min(18, width / 35)}" fill="#E2D5BE" text-anchor="middle" opacity="0.9">
        ${subtitle}
      </text>
      <text x="${width / 2}" y="${height - 45}" font-family="'Noto Sans Devanagari', sans-serif" font-size="13" fill="${accentColor}" text-anchor="middle" opacity="0.7">
        यदुवंशी दुर्गा पूजा कपूरिपुर • डिजिटल स्मृति संचय
      </text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .webp({ quality: 90 })
    .toFile(filepath);
};

export const seedDatabase = async () => {
  try {
    logger.info('Connecting to database for seeding...');
    await mongoose.connect(ENV.MONGODB_URI);
    logger.info('Connected to MongoDB.');

    // Ensure directories
    ImageService.ensureUploadDirs();
    const uploadsDir = path.resolve(process.cwd(), 'uploads');

    // Generate seed sample images
    logger.info('Generating sample seed assets...');
    const seedAssets = [
      {
        id: 'seed-pandal-2024',
        title: 'भव्य दुर्गा पूजा पंडाल २०२४',
        subtitle: 'कपूरिपुर मुख्य प्रांगण की दिव्य छटा',
        year: 2024,
      },
      {
        id: 'seed-aarti-2024',
        title: 'महाअष्टमी महाआरती',
        subtitle: 'श्रद्धालुओं की भक्तिमय उपस्थिति एवं दीप प्रज्ज्वलन',
        year: 2024,
      },
      {
        id: 'seed-dhunuchi-2023',
        title: 'धुनुची नृत्य उत्सव २०२३',
        subtitle: 'परंपरागत ढाक की थाप पर भावविभोर युवा',
        year: 2023,
      },
      {
        id: 'seed-sindoor-2023',
        title: 'सिंदूर खेला विदाई बेला',
        subtitle: 'माँ को भावभीनी विदाई एवं सुहाग पर्व',
        year: 2023,
      },
      {
        id: 'seed-pratima-2022',
        title: 'माँ दुर्गा की प्रतिमा २०२२',
        subtitle: 'मूर्तिकारों की अद्भुत कला एवं अलौकिक रूप',
        year: 2022,
      },
      {
        id: 'seed-visarjan-2021',
        title: 'शोभायात्रा एवं विसर्जन २०२१',
        subtitle: 'अगले वर्ष फिर आने के जयकारों के साथ',
        year: 2021,
      },
    ];

    for (const asset of seedAssets) {
      const mainPath = path.join(uploadsDir, 'memories', `memory-${asset.id}.webp`);
      const thumbPath = path.join(uploadsDir, 'thumbnails', `thumb-${asset.id}.webp`);

      await createSampleWebpImage(mainPath, 1200, 800, asset.title, asset.subtitle, '#5F1218', '#B88A3B');
      await createSampleWebpImage(thumbPath, 450, 300, asset.title, asset.subtitle, '#5F1218', '#B88A3B');
    }

    // Committee portraits
    const committeeSeedData = [
      {
        id: 'comm-1',
        name: 'श्री रामेश्वर यादव',
        designation: 'अध्यक्ष (President)',
        bio: 'पिछले ३५ वर्षों से कपूरिपुर दुर्गा पूजा समिति के सेवादार एवं संरक्षक।',
        order: 1,
      },
      {
        id: 'comm-2',
        name: 'श्री अखिलेश यादव',
        designation: 'सचिव (General Secretary)',
        bio: 'पूजा व्यवस्था, प्रशासनिक समन्वय एवं समुदाय सेवा प्रमुख।',
        order: 2,
      },
      {
        id: 'comm-3',
        name: 'श्री विजय कुमार यादव',
        designation: 'कोषाध्यक्ष (Treasurer)',
        bio: 'पूजा समिति के वित्तीय एवं दान संचय प्रबंधन प्रभारी।',
        order: 3,
      },
      {
        id: 'comm-4',
        name: 'श्री धर्मेन्द्र यादव',
        designation: 'पंडाल एवं विद्युत व्यवस्थापक',
        bio: 'भव्य प्रकाश व्यवस्था, पंडाल निर्माण एवं सुरक्षा प्रभारी।',
        order: 4,
      },
      {
        id: 'comm-5',
        name: 'श्री अभिषेक यादव',
        designation: 'युवा संयोजक एवं डिजिटल प्रभारी',
        bio: 'डिजिटल अभिलेखागार, युवा समन्वय एवं सांस्कृतिक आयोजन।',
        order: 5,
      },
      {
        id: 'comm-6',
        name: 'श्रीमती सुनीता देवी',
        designation: 'सांस्कृतिक एवं भोग संयोजिका',
        bio: 'महाप्रसाद वितरण, महिला सहभागिता एवं भजन संध्या संचालन।',
        order: 6,
      },
    ];

    for (const comm of committeeSeedData) {
      const portraitPath = path.join(uploadsDir, 'committee', `committee-${comm.id}.webp`);
      await createSampleWebpImage(portraitPath, 500, 500, comm.name, comm.designation, '#460C11', '#B88A3B');
    }

    // Clean existing data
    logger.info('Clearing old database records...');
    await User.deleteMany({});
    await Memory.deleteMany({});
    await CommitteeMember.deleteMany({});
    await Report.deleteMany({});

    // Create Super Admin, Admin, and Devotee Users
    const passwordHash = await bcrypt.hash('DurgaPuja@2026', 12);

    const superAdminUser = await User.create({
      name: 'मुख्य व्यवस्थापक (Super Admin)',
      email: 'superadmin@kapooripur.online',
      passwordHash,
      role: 'SUPERADMIN',
      isEmailVerified: true,
      avatar: '',
    });

    const adminUser = await User.create({
      name: 'समिति व्यवस्थापक (Admin)',
      email: 'admin@kapooripur.online',
      passwordHash,
      role: 'ADMIN',
      isEmailVerified: true,
      avatar: '',
    });

    const user1 = await User.create({
      name: 'अभिषेक यादव',
      email: 'abhishek@kapooripur.online',
      passwordHash,
      role: 'USER',
      isEmailVerified: true,
    });

    const user2 = await User.create({
      name: 'प्रिया कुमारी',
      email: 'priya@kapooripur.online',
      passwordHash,
      role: 'USER',
      isEmailVerified: true,
    });

    const user3 = await User.create({
      name: 'आनन्द कुमार',
      email: 'anand@kapooripur.online',
      passwordHash,
      role: 'USER',
      isEmailVerified: true,
    });

    logger.info('Users created: Super Admin, Admin, and 3 Devotees.');

    // Create Memories
    const memoriesData = [
      {
        userId: adminUser._id,
        imageUrl: `/uploads/memories/memory-seed-pandal-2024.webp`,
        thumbnailUrl: `/uploads/thumbnails/thumb-seed-pandal-2024.webp`,
        caption: 'वर्ष २०२४ की यदुवंशी दुर्गा पूजा का भव्य पंडाल। कपूरिपुर के सभी ग्रामवासियों और भक्तों के सहयोग से निर्मित यह अलौकिक धाम।',
        year: 2024,
        status: 'published',
      },
      {
        userId: user1._id,
        imageUrl: `/uploads/memories/memory-seed-aarti-2024.webp`,
        thumbnailUrl: `/uploads/thumbnails/thumb-seed-aarti-2024.webp`,
        caption: 'महाअष्टमी की पावन आरती का क्षण। १०८ दीपों की रोशनी में जगमगाती माँ जगदम्बा की आलौकिक मूरत।',
        year: 2024,
        status: 'published',
      },
      {
        userId: user2._id,
        imageUrl: `/uploads/memories/memory-seed-dhunuchi-2023.webp`,
        thumbnailUrl: `/uploads/thumbnails/thumb-seed-dhunuchi-2023.webp`,
        caption: '२०२३ का धुनुची नृत्य। ढाक की गूंज और कपूरिपुर के युवाओं का भक्तिमय समर्पण। हर वर्ष यह पल हृदय को छू जाता है।',
        year: 2023,
        status: 'published',
      },
      {
        userId: user3._id,
        imageUrl: `/uploads/memories/memory-seed-sindoor-2023.webp`,
        thumbnailUrl: `/uploads/thumbnails/thumb-seed-sindoor-2023.webp`,
        caption: 'विजयदशमी के दिन सिंदूर खेला का पावन दृश्य। माँ को विदाई देते हुए सभी माताओं और बहनों की आंखें नम थीं।',
        year: 2023,
        status: 'published',
      },
      {
        userId: user1._id,
        imageUrl: `/uploads/memories/memory-seed-pratima-2022.webp`,
        thumbnailUrl: `/uploads/thumbnails/thumb-seed-pratima-2022.webp`,
        caption: 'वर्ष २०२२ में माँ की सौम्य एवं तेजमयी प्रतिमा। कोलकाता के मूर्तिकारों द्वारा तैयार की गई यह ऐतिहासिक मूर्ति।',
        year: 2022,
        status: 'published',
      },
      {
        userId: adminUser._id,
        imageUrl: `/uploads/memories/memory-seed-visarjan-2021.webp`,
        thumbnailUrl: `/uploads/thumbnails/thumb-seed-visarjan-2021.webp`,
        caption: '२०२१ की पावन शोभायात्रा। पूरे कपूरिपुर गांव में भ्रमण के पश्चात माँ का गंगा में पवित्र विसर्जन।',
        year: 2021,
        status: 'published',
      },
    ];

    await Memory.insertMany(memoriesData);
    logger.info(`Inserted ${memoriesData.length} initial memories.`);

    // Create Committee Members
    const committeeData = committeeSeedData.map((c) => ({
      name: c.name,
      photoUrl: `/uploads/committee/committee-${c.id}.webp`,
      designation: c.designation,
      bio: c.bio,
      displayOrder: c.order,
      isActive: true,
    }));

    await CommitteeMember.insertMany(committeeData);
    logger.info(`Inserted ${committeeData.length} committee members.`);

    // Clean up any old dummy visitor test records
    await VisitorSession.deleteMany({ visitorId: { $regex: /^visitor_seed_/ } });
    logger.info('Cleaned up dummy visitor seed records. Real visitor analytics active.');

    logger.info('✅ Database seeding successfully completed!');
    logger.info('===============================================');
    logger.info('Default Super Admin (Full Control & Overview):');
    logger.info('Email    : superadmin@kapooripur.online');
    logger.info('Password : DurgaPuja@2026');
    logger.info('-----------------------------------------------');
    logger.info('Default Admin / Moderator (No Overview Access):');
    logger.info('Email    : admin@kapooripur.online');
    logger.info('Password : DurgaPuja@2026');
    logger.info('===============================================');

    process.exit(0);
  } catch (error) {
    logger.error('Error during database seed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}
