import React, { useEffect, useState } from 'react';
import { adService } from '../../services/adService';
import { Ad } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { getImageUrl } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  MousePointerClick,
  Percent,
  Sparkles,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Search,
  Calendar,
} from 'lucide-react';

export const AdminAds: React.FC = () => {
  const { isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const toast = useToast();

  useEffect(() => {
    if (!isSuperAdmin) {
      navigate('/admin/memories', { replace: true });
    }
  }, [isSuperAdmin, navigate]);

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [sponsorName, setSponsorName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [priority, setPriority] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Delete modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchAds = async () => {
    setIsLoading(true);
    try {
      const res = await adService.getAllAds();
      if (res.success && Array.isArray(res.data)) {
        setAds(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load ads');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const openAddModal = () => {
    setEditingAd(null);
    setTitle('');
    setSponsorName('');
    setLinkUrl('');
    setPriority(0);
    setIsActive(true);
    setStartDate('');
    setEndDate('');
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (ad: Ad) => {
    setEditingAd(ad);
    setTitle(ad.title);
    setSponsorName(ad.sponsorName);
    setLinkUrl(ad.linkUrl);
    setPriority(ad.priority || 0);
    setIsActive(ad.isActive);
    setStartDate(ad.startDate ? new Date(ad.startDate).toISOString().slice(0, 10) : '');
    setEndDate(ad.endDate ? new Date(ad.endDate).toISOString().slice(0, 10) : '');
    setImageFile(null);
    setImagePreview(getImageUrl(ad.imageUrl));
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !sponsorName.trim() || !linkUrl.trim()) {
      toast.error('Title, Sponsor Name, and Destination URL are required.');
      return;
    }

    if (!editingAd && !imageFile) {
      toast.error('Please upload an ad banner image.');
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('sponsorName', sponsorName.trim());
      formData.append('linkUrl', linkUrl.trim());
      formData.append('priority', priority.toString());
      formData.append('isActive', isActive ? 'true' : 'false');
      if (startDate) formData.append('startDate', startDate);
      if (endDate) formData.append('endDate', endDate);
      if (imageFile) formData.append('image', imageFile);

      if (editingAd) {
        const res = await adService.updateAd(editingAd._id, formData);
        if (res.success) {
          toast.success('Ad updated successfully');
          setAds((prev) => prev.map((a) => (a._id === editingAd._id ? res.data : a)));
          setIsModalOpen(false);
        }
      } else {
        const res = await adService.createAd(formData);
        if (res.success) {
          toast.success('New ad created successfully');
          setAds((prev) => [res.data, ...prev]);
          setIsModalOpen(false);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (ad: Ad) => {
    try {
      const formData = new FormData();
      formData.append('isActive', (!ad.isActive).toString());
      const res = await adService.updateAd(ad._id, formData);
      if (res.success) {
        toast.success(ad.isActive ? 'Ad deactivated' : 'Ad activated');
        setAds((prev) => prev.map((a) => (a._id === ad._id ? { ...a, isActive: !ad.isActive } : a)));
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update ad status');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await adService.deleteAd(deletingId);
      toast.success('Ad deleted successfully');
      setAds((prev) => prev.filter((a) => a._id !== deletingId));
      setDeletingId(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete ad');
    } finally {
      setIsDeleting(false);
    }
  };

  // Metrics calculation
  const totalImpressions = ads.reduce((acc, ad) => acc + (ad.impressions || 0), 0);
  const totalClicks = ads.reduce((acc, ad) => acc + (ad.clicks || 0), 0);
  const activeCount = ads.filter((ad) => ad.isActive).length;
  const overallCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

  const filteredAds = ads.filter(
    (ad) =>
      ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.sponsorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 text-gold-900 text-xs font-semibold font-body mb-2 border border-gold-400/40">
            <Sparkles className="w-3.5 h-3.5 text-gold-700" />
            <span>Native In-Feed Sponsorships</span>
          </div>
          <h1 className="text-2xl font-heading font-bold text-dark-950">
            In-Feed Ads Management
          </h1>
          <p className="text-xs sm:text-sm font-body text-muted mt-0.5">
            Manage seamless, native sponsored cards that blend naturally inside the Memories feed.
          </p>
        </div>

        <Button
          variant="gold"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={openAddModal}
        >
          Create New Ad
        </Button>
      </div>

      {/* 2. Analytics Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-cream-100 p-4 rounded-2xl border border-cream-300 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted text-xs font-body">
            <span>Active / Total</span>
            <Layers className="w-4 h-4 text-maroon-700" />
          </div>
          <p className="text-2xl font-heading font-bold text-dark-950">
            {activeCount} <span className="text-sm font-body text-muted font-normal">/ {ads.length}</span>
          </p>
        </div>

        <div className="bg-cream-100 p-4 rounded-2xl border border-cream-300 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted text-xs font-body">
            <span>Total Impressions</span>
            <Eye className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-heading font-bold text-dark-950">
            {totalImpressions.toLocaleString()}
          </p>
        </div>

        <div className="bg-cream-100 p-4 rounded-2xl border border-cream-300 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted text-xs font-body">
            <span>Total Clicks</span>
            <MousePointerClick className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-heading font-bold text-dark-950">
            {totalClicks.toLocaleString()}
          </p>
        </div>

        <div className="bg-cream-100 p-4 rounded-2xl border border-cream-300 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted text-xs font-body">
            <span>Avg. Click Rate (CTR)</span>
            <Percent className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-heading font-bold text-maroon-900">
            {overallCtr}%
          </p>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-cream-100 p-3 sm:p-4 rounded-2xl border border-cream-300 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search ads by title or sponsor..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-cream-300 bg-cream-50 text-xs sm:text-sm font-body text-dark-900 placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-maroon-600"
          />
        </div>
        <span className="text-xs font-body text-muted shrink-0">
          Showing {filteredAds.length} {filteredAds.length === 1 ? 'ad' : 'ads'}
        </span>
      </div>

      {/* 4. Table of Ads */}
      <div className="bg-cream-100 rounded-2xl border border-cream-300 shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-3 border-maroon-700 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="font-body text-xs text-muted">Loading ads...</p>
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="py-16 text-center text-muted font-body text-sm">
            {searchTerm ? 'No ads matched your search criteria.' : 'No in-feed ads have been created yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-body text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-cream-300 bg-cream-200/60 text-dark-900 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-3.5 px-4">Banner / Ad</th>
                  <th className="py-3.5 px-4">Sponsor</th>
                  <th className="py-3.5 px-4">Impressions</th>
                  <th className="py-3.5 px-4">Clicks</th>
                  <th className="py-3.5 px-4">CTR</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-300/80">
                {filteredAds.map((ad) => {
                  const ctr =
                    ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : '0.0';

                  return (
                    <tr key={ad._id} className="hover:bg-cream-200/40 transition-colors">
                      {/* Image & Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getImageUrl(ad.imageUrl)}
                            alt={ad.title}
                            className="w-14 h-14 rounded-xl object-cover border border-cream-300 shrink-0 bg-cream-200"
                          />
                          <div className="max-w-xs">
                            <p className="font-bold text-dark-950 line-clamp-1 leading-snug">
                              {ad.title}
                            </p>
                            <a
                              href={ad.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-maroon-700 hover:underline inline-flex items-center gap-1 font-mono mt-0.5"
                            >
                              <span className="truncate max-w-[180px]">{ad.linkUrl}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Sponsor */}
                      <td className="py-3 px-4 font-semibold text-dark-900">
                        {ad.sponsorName}
                      </td>

                      {/* Impressions */}
                      <td className="py-3 px-4 font-mono font-medium text-dark-900">
                        {ad.impressions.toLocaleString()}
                      </td>

                      {/* Clicks */}
                      <td className="py-3 px-4 font-mono font-medium text-dark-900">
                        {ad.clicks.toLocaleString()}
                      </td>

                      {/* CTR% */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-cream-200 text-dark-900 font-mono font-bold text-xs border border-cream-300">
                          {ctr}%
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-4 font-mono text-dark-800">
                        {ad.priority || 0}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleActive(ad)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-xs ${
                            ad.isActive
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-900 border border-rose-300 hover:bg-rose-200'
                          }`}
                        >
                          {ad.isActive ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-rose-700" />
                              <span>Inactive</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(ad)}
                            className="p-1.5 text-muted hover:text-dark-950 hover:bg-cream-200 rounded-lg transition-colors"
                            title="Edit Ad"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingId(ad._id)}
                            className="p-1.5 text-muted hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Ad"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Create / Edit Ad Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAd ? 'Edit In-Feed Ad' : 'Create Native In-Feed Ad'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 font-body text-xs sm:text-sm">
          {/* Ad Title */}
          <div>
            <label className="block font-bold text-dark-900 mb-1">
              Ad Title / Caption *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Authentic Sweets & Prasadam for Puja"
              className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 focus:outline-none focus:ring-2 focus:ring-maroon-600"
            />
          </div>

          {/* Sponsor Name & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-dark-900 mb-1">
                Sponsor / Brand Name *
              </label>
              <input
                type="text"
                required
                value={sponsorName}
                onChange={(e) => setSponsorName(e.target.value)}
                placeholder="e.g., Kapooripur Sweets"
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 focus:outline-none focus:ring-2 focus:ring-maroon-600"
              />
            </div>

            <div>
              <label className="block font-bold text-dark-900 mb-1">
                Display Priority (Higher = Earlier in feed)
              </label>
              <input
                type="number"
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value, 10) || 0)}
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 focus:outline-none focus:ring-2 focus:ring-maroon-600"
              />
            </div>
          </div>

          {/* Destination Link URL */}
          <div>
            <label className="block font-bold text-dark-900 mb-1">
              Destination URL (Where user lands upon clicking) *
            </label>
            <input
              type="url"
              required
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com/special-offer"
              className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 font-mono focus:outline-none focus:ring-2 focus:ring-maroon-600"
            />
          </div>

          {/* Start and End Date (Optional Schedule) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-dark-900 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-muted" />
                <span>Start Date (Optional)</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 focus:outline-none focus:ring-2 focus:ring-maroon-600"
              />
            </div>

            <div>
              <label className="block font-bold text-dark-900 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-muted" />
                <span>End Date (Optional)</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 focus:outline-none focus:ring-2 focus:ring-maroon-600"
              />
            </div>
          </div>

          {/* Image Upload & Preview */}
          <div>
            <label className="block font-bold text-dark-900 mb-1">
              Ad Banner / Creative Image * {editingAd && '(Leave empty to keep current image)'}
            </label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-20 h-20 rounded-xl object-cover border border-cream-300 shrink-0 bg-cream-200"
                />
              )}
              <label className="flex-1 border-2 border-dashed border-cream-300 hover:border-maroon-700 rounded-xl p-4 text-center cursor-pointer bg-cream-50 transition-colors">
                <ImageIcon className="w-6 h-6 text-muted mx-auto mb-1" />
                <span className="text-xs font-semibold text-dark-900 block">
                  {imageFile ? imageFile.name : 'Select or drop ad banner (JPG, PNG, WebP)'}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Active Status Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-maroon-700 focus:ring-maroon-600"
              />
              <span className="font-bold text-dark-900">Activate Ad Immediately</span>
            </label>
          </div>

          {/* Submit / Cancel buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-cream-300">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
            >
              {editingAd ? 'Update Ad' : 'Publish Ad'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 6. Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Confirm Delete Ad"
      >
        <div className="space-y-4 font-body">
          <p className="text-sm text-dark-800 leading-relaxed">
            Are you sure you want to delete this sponsored ad? Historical analytics and creative assets for this campaign will be removed.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-cream-300">
            <Button variant="outline" size="md" onClick={() => setDeletingId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Yes, Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminAds;
