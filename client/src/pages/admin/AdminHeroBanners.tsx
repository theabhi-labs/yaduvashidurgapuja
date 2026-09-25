import React, { useEffect, useState } from 'react';
import { heroBannerService } from '../../services/heroBannerService';
import { HeroBanner } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { getImageUrl } from '../../utils/helpers';
import {
  Plus,
  Edit,
  Trash2,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Search,
} from 'lucide-react';

export const AdminHeroBanners: React.FC = () => {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const toast = useToast();

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [badge, setBadge] = useState('कपूरिपुर पावन धाम');
  const [subtext, setSubtext] = useState('');
  const [order, setOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Delete modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const res = await heroBannerService.getAllBanners();
      if (res.success && Array.isArray(res.data)) {
        setBanners(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load hero banners');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openAddModal = () => {
    setEditingBanner(null);
    setTitle('');
    setBadge('कपूरिपुर पावन धाम');
    setSubtext('');
    setOrder(banners.length);
    setIsActive(true);
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (banner: HeroBanner) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setBadge(banner.badge || 'कपूरिपुर पावन धाम');
    setSubtext(banner.subtext || '');
    setOrder(banner.order || 0);
    setIsActive(banner.isActive);
    setImageFile(null);
    setImagePreview(getImageUrl(banner.imageUrl));
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a banner title');
      return;
    }
    if (!editingBanner && !imageFile) {
      toast.error('Please upload a hero banner poster image');
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('badge', badge.trim());
      formData.append('subtext', subtext.trim());
      formData.append('order', String(order));
      formData.append('isActive', String(isActive));

      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (editingBanner) {
        await heroBannerService.updateBanner(editingBanner._id, formData);
        toast.success('Hero poster updated successfully!');
      } else {
        await heroBannerService.createBanner(formData);
        toast.success('New Hero poster added successfully!');
      }

      setIsModalOpen(false);
      fetchBanners();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save hero banner');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (banner: HeroBanner) => {
    try {
      await heroBannerService.toggleActive(banner._id);
      toast.success(
        `Poster is now ${!banner.isActive ? 'Active (Visible)' : 'Inactive (Hidden)'}`
      );
      fetchBanners();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update poster status');
    }
  };

  const handleDeleteBanner = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await heroBannerService.deleteBanner(deletingId);
      toast.success('Hero poster deleted successfully');
      setDeletingId(null);
      fetchBanners();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete hero banner');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredBanners = banners.filter(
    (b) =>
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.badge && b.badge.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-dark-900 text-cream-100 p-6 md:p-8 rounded-3xl border border-dark-700 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Home Showcase Customization
          </div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-cream-50">
            Hero Posters & Slideshow
          </h1>
          <p className="text-xs md:text-sm font-body text-cream-200/80 max-w-2xl">
            Upload multiple high-resolution photos for the home page hero showcase, customize titles and devotional badges, and control their order and animations.
          </p>
        </div>

        <Button
          onClick={openAddModal}
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          className="relative z-10 shrink-0 font-bold"
        >
          Add New Poster
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500" />
          <input
            type="text"
            placeholder="Search posters by title or badge..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-cream-300 bg-cream-50 text-dark-950 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
        </div>

        <div className="text-xs font-semibold text-dark-600 font-body">
          Total Posters: {banners.length} ({banners.filter((b) => b.isActive).length} Active)
        </div>
      </div>

      {/* Poster Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-cream-200 animate-pulse border border-cream-300"
            />
          ))}
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="text-center py-16 bg-cream-100/60 rounded-3xl border border-cream-300/60 p-8 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
            <ImageIcon className="w-7 h-7" />
          </div>
          <h3 className="font-heading font-bold text-lg text-dark-900">
            No Custom Hero Posters Yet
          </h3>
          <p className="text-xs text-dark-600 max-w-md mx-auto">
            Currently the website is displaying the default Maa Durga poster. Click "Add New Poster" to add your first custom slide!
          </p>
          <Button onClick={openAddModal} variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Add First Poster
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBanners.map((banner) => (
            <div
              key={banner._id}
              className={`group bg-cream-50 rounded-2xl border ${
                banner.isActive ? 'border-amber-400/50 shadow-md' : 'border-cream-300 opacity-70'
              } overflow-hidden flex flex-col justify-between transition-all hover:shadow-xl`}
            >
              <div>
                {/* Poster Image Preview */}
                <div className="relative aspect-[16/9] bg-dark-950 overflow-hidden">
                  <img
                    src={getImageUrl(banner.imageUrl)}
                    alt={banner.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent flex items-end p-4">
                    {banner.badge && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-dark-950 font-body uppercase tracking-wider">
                        {banner.badge}
                      </span>
                    )}
                  </div>

                  {/* Priority Order Badge */}
                  <span className="absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-dark-950/80 text-amber-300 border border-amber-500/30">
                    Order: #{banner.order}
                  </span>
                </div>

                {/* Poster Content */}
                <div className="p-4 space-y-2">
                  <h4 className="font-heading font-bold text-sm text-dark-950 leading-snug line-clamp-2">
                    {banner.title}
                  </h4>
                  {banner.subtext && (
                    <p className="text-xs font-body text-dark-700 line-clamp-2">
                      {banner.subtext}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 pt-2 border-t border-cream-200 flex items-center justify-between">
                <button
                  onClick={() => handleToggleActive(banner)}
                  className={`inline-flex items-center gap-1 text-xs font-bold font-body px-2.5 py-1 rounded-lg transition-colors ${
                    banner.isActive
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-cream-200 text-dark-600 hover:bg-cream-300'
                  }`}
                >
                  {banner.isActive ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-dark-500" /> Inactive
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(banner)}
                    className="p-1.5 rounded-lg text-dark-700 hover:text-amber-800 hover:bg-cream-200 transition-colors"
                    title="Edit Poster"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingId(banner._id)}
                    className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors"
                    title="Delete Poster"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Poster Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBanner ? 'Edit Hero Poster' : 'Add New Hero Poster'}
      >
        <form onSubmit={handleSaveBanner} className="space-y-4">
          {/* Photo File Picker & Preview */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-dark-800 uppercase tracking-wider font-body">
              Poster Image (16:9 Recommended) *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-xs text-dark-700 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-maroon-800 file:text-cream-100 hover:file:bg-maroon-900 cursor-pointer border border-cream-300 rounded-xl p-1 bg-cream-50"
            />
            {imagePreview && (
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-dark-950 border border-amber-400/40 mt-2">
                <img
                  src={imagePreview}
                  alt="Poster preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Devotional Badge */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-dark-800 uppercase tracking-wider font-body">
              Badge Text (e.g., कपूरिपुर पावन धाम)
            </label>
            <input
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="e.g. कपूरिपुर पावन धाम / महाआरती दर्शन"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-cream-300 bg-cream-50 text-dark-950 focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          {/* Main Title / Caption */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-dark-800 uppercase tracking-wider font-body">
              Main Title / Devotional Text *
            </label>
            <textarea
              rows={2}
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. माँ दुर्गा की असीम कृपा और भक्तों की अनमोल आस्था को समर्पित एक पावन डिजिटल धरोहर।"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-cream-300 bg-cream-50 text-dark-950 focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          {/* Optional Subtext */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-dark-800 uppercase tracking-wider font-body">
              Subtext (Optional)
            </label>
            <input
              type="text"
              value={subtext}
              onChange={(e) => setSubtext(e.target.value)}
              placeholder="e.g. माँ भगवती की अखंड ज्योति एवं दिव्य आरती"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-cream-300 bg-cream-50 text-dark-950 focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Display Order */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-dark-800 uppercase tracking-wider font-body">
                Display Order
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-cream-300 bg-cream-50 text-dark-950 focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            {/* Is Active */}
            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="isActivePoster"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <label
                htmlFor="isActivePoster"
                className="text-xs font-bold text-dark-800 font-body cursor-pointer select-none"
              >
                Active on Home Page
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-cream-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
            >
              {editingBanner ? 'Save Changes' : 'Upload Poster'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Confirm Poster Deletion"
      >
        <div className="space-y-4">
          <p className="text-sm font-body text-dark-800">
            Are you sure you want to delete this hero poster? It will be permanently removed from the home page slideshow.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-cream-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeletingId(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              onClick={handleDeleteBanner}
            >
              Delete Poster
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
