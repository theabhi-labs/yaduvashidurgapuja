import React, { useEffect, useState } from 'react';
import { pujaScheduleService } from '../../services/pujaScheduleService';
import { PujaSchedule } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import {
  Plus,
  Edit,
  Trash2,
  Flame,
  CheckCircle2,
  XCircle,
  Bell,
} from 'lucide-react';

export const AdminPujaSchedules: React.FC = () => {
  const [schedules, setSchedules] = useState<PujaSchedule[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const toast = useToast();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSchedule, setEditingSchedule] = useState<PujaSchedule | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [isSpecial, setIsSpecial] = useState<boolean>(false);
  const [order, setOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);

  // Delete modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      const res = await pujaScheduleService.getAllSchedules();
      if (res.success && Array.isArray(res.data)) {
        setSchedules(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load aarti timings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const openAddModal = () => {
    setEditingSchedule(null);
    setTitle('');
    setTime('07:30 PM');
    setDescription('');
    setIsSpecial(false);
    setOrder(schedules.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: PujaSchedule) => {
    setEditingSchedule(item);
    setTitle(item.title);
    setTime(item.time);
    setDescription(item.description || '');
    setIsSpecial(item.isSpecial || false);
    setOrder(item.order || 0);
    setIsActive(item.isActive);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !time.trim()) {
      toast.error('Please enter both title and timing');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: title.trim(),
        time: time.trim(),
        description: description.trim() || undefined,
        isSpecial,
        order: Number(order) || 0,
        isActive,
      };

      if (editingSchedule) {
        await pujaScheduleService.updateSchedule(editingSchedule._id, payload);
        toast.success('Aarti timing updated successfully!');
      } else {
        await pujaScheduleService.createSchedule(payload);
        toast.success('New Aarti timing added successfully!');
      }

      setIsModalOpen(false);
      fetchSchedules();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save aarti timing');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (item: PujaSchedule) => {
    try {
      await pujaScheduleService.toggleActive(item._id);
      toast.success(
        `Timing is now ${!item.isActive ? 'Active (Visible)' : 'Inactive (Hidden)'}`
      );
      fetchSchedules();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await pujaScheduleService.deleteSchedule(deletingId);
      toast.success('Aarti timing deleted successfully');
      setDeletingId(null);
      fetchSchedules();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete timing');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-dark-900 text-cream-100 p-6 md:p-8 rounded-3xl border border-dark-700 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
            <Bell className="w-3.5 h-3.5" />
            Puja & Aarti Schedule
          </div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-cream-50">
            Puja Schedule (पूजा समय सारणी)
          </h1>
          <p className="text-xs md:text-sm font-body text-cream-200/80 max-w-2xl">
            Configure the daily puja schedule, Mangala Aarti, Bhog, and evening Maha Aarti timings displayed on the website and mobile views.
          </p>
        </div>

        <Button
          onClick={openAddModal}
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          className="relative z-10 shrink-0 font-bold"
        >
          Add New Schedule
        </Button>
      </div>

      {/* Cards List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-44 rounded-2xl bg-cream-200 animate-pulse border border-cream-300"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {schedules.map((item) => (
            <div
              key={item._id}
              className={`bg-cream-50 rounded-2xl border ${
                item.isSpecial
                  ? 'border-amber-400 bg-gradient-to-b from-amber-50/50 to-cream-50 shadow-md'
                  : 'border-cream-300 shadow-sm'
              } p-5 flex flex-col justify-between transition-all hover:shadow-lg`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cream-200 text-dark-800 font-mono">
                    #{item.order}
                  </span>

                  {item.isSpecial && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-dark-950 uppercase tracking-wider font-body">
                      <Flame className="w-3 h-3 text-dark-950" /> Special Aarti
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-2xl font-heading font-black text-maroon-900 tracking-tight">
                    {item.time}
                  </div>
                  <h3 className="font-heading font-bold text-base text-dark-950 mt-1">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs font-body text-dark-600 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-cream-200 flex items-center justify-between">
                <button
                  onClick={() => handleToggleActive(item)}
                  className={`inline-flex items-center gap-1 text-xs font-bold font-body px-2.5 py-1 rounded-lg transition-colors ${
                    item.isActive
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-cream-200 text-dark-600 hover:bg-cream-300'
                  }`}
                >
                  {item.isActive ? (
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
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg text-dark-700 hover:text-amber-800 hover:bg-cream-200 transition-colors"
                    title="Edit Timing"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingId(item._id)}
                    className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors"
                    title="Delete Timing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSchedule ? 'Edit Aarti Timing' : 'Add New Aarti Timing'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-dark-800 uppercase tracking-wider font-body">
              Puja / Aarti Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. संध्या दिव्य महाआरती / प्रातः मंगला आरती"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-cream-300 bg-cream-50 text-dark-950 focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-dark-800 uppercase tracking-wider font-body">
              Aarti Time (e.g., 07:30 PM) *
            </label>
            <input
              type="text"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="e.g. 07:30 PM or 06:30 AM"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-cream-300 bg-cream-50 text-dark-950 focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-dark-800 uppercase tracking-wider font-body">
              Short Devotional Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. कपूरिपुर प्रांगण में भव्य 108 दीप महाआरती व शंखनाद"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-cream-300 bg-cream-50 text-dark-950 focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="isSpecialCheck"
                checked={isSpecial}
                onChange={(e) => setIsSpecial(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <label
                htmlFor="isSpecialCheck"
                className="text-xs font-bold text-dark-800 font-body cursor-pointer select-none"
              >
                Highlight as Major Aarti ⭐
              </label>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
            />
            <label
              htmlFor="isActiveCheck"
              className="text-xs font-bold text-dark-800 font-body cursor-pointer select-none"
            >
              Active on Website & Mobile
            </label>
          </div>

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
              {editingSchedule ? 'Save Changes' : 'Add Timing'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Confirm Timing Deletion"
      >
        <div className="space-y-4">
          <p className="text-sm font-body text-dark-800">
            Are you sure you want to delete this aarti timing?
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
              onClick={handleDelete}
            >
              Delete Timing
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
