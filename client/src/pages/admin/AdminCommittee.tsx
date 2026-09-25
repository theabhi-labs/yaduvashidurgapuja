import React, { useEffect, useState } from 'react';
import { committeeService } from '../../services/committeeService';
import { CommitteeMember } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { getImageUrl } from '../../utils/helpers';
import {
  Plus,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';

export const AdminCommittee: React.FC = () => {
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const toast = useToast();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<CommitteeMember | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form Fields
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [bio, setBio] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Delete modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const res = await committeeService.getAllMembersAdmin();
      if (res.success) {
        setMembers(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'समिति सदस्य लोड करने में त्रुटि');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const openAddModal = () => {
    setEditingMember(null);
    setName('');
    setDesignation('');
    setBio('');
    setDisplayOrder(members.length + 1);
    setIsActive(true);
    setPhotoFile(null);
    setPhotoPreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (member: CommitteeMember) => {
    setEditingMember(member);
    setName(member.name);
    setDesignation(member.designation);
    setBio(member.bio || '');
    setDisplayOrder(member.displayOrder);
    setIsActive(member.isActive);
    setPhotoFile(null);
    setPhotoPreview(member.photoUrl ? getImageUrl(member.photoUrl) : null);
    setIsModalOpen(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !designation) {
      toast.error('कृपया नाम और पद दर्ज करें');
      return;
    }

    if (!editingMember && !photoFile) {
      toast.error('कृपया सदस्य का फोटो अपलोड करें');
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('designation', designation.trim());
      formData.append('bio', bio.trim());
      formData.append('displayOrder', displayOrder.toString());
      formData.append('isActive', String(isActive));
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      if (editingMember) {
        await committeeService.updateMember(editingMember._id, formData);
        toast.success('सदस्य विवरण अपडेट हो गया');
      } else {
        await committeeService.createMember(formData);
        toast.success('नया समिति सदस्य जोड़ा गया');
      }

      setIsModalOpen(false);
      fetchMembers();
    } catch (err: any) {
      toast.error(err.message || 'सहेजने में त्रुटि हुई');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await committeeService.deleteMember(deletingId);
      toast.success('समिति सदस्य हटा दिया गया');
      setMembers((prev) => prev.filter((m) => m._id !== deletingId));
      setDeletingId(null);
    } catch (err: any) {
      toast.error(err.message || 'हटाने में समस्या आई');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= members.length) return;

    const newMembers = [...members];
    const temp = newMembers[index];
    newMembers[index] = newMembers[targetIndex];
    newMembers[targetIndex] = temp;

    // Update order numbers
    const orders = newMembers.map((m, idx) => ({
      id: m._id,
      displayOrder: idx + 1,
    }));

    setMembers(newMembers.map((m, idx) => ({ ...m, displayOrder: idx + 1 })));

    try {
      await committeeService.reorderMembers(orders);
      toast.success('क्रम अद्यतित हुआ');
    } catch (err: any) {
      toast.error('क्रम अद्यतित करने में त्रुटि');
      fetchMembers();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-devanagari-heading font-bold text-dark-950">
            समिति कार्यकारिणी प्रबंधन (Committee Management)
          </h1>
          <p className="text-xs sm:text-sm font-devanagari-body text-muted mt-1">
            पूजा समिति पदाधिकारियों की सूची, फोटो, पदनाम एवं प्रदर्शन क्रम निर्धारित करें।
          </p>
        </div>

        <Button
          variant="gold"
          size="md"
          onClick={openAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
          className="font-devanagari-body font-bold"
        >
          नया सदस्य जोड़ें
        </Button>
      </div>

      {/* Committee Table */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-maroon-700" />
          <p className="text-xs font-devanagari-body text-muted">सदस्य लोड हो रहे हैं...</p>
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-16 bg-cream-100 rounded-2xl border border-cream-300">
          <p className="text-sm font-devanagari-body text-muted mb-4">
            अभी कोई समिति सदस्य पंजीकृत नहीं है।
          </p>
          <Button variant="primary" size="sm" onClick={openAddModal}>
            पहला सदस्य जोड़ें
          </Button>
        </div>
      ) : (
        <div className="bg-cream-100 rounded-2xl border border-cream-300 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-cream-200/80 border-b border-cream-300 text-[11px] font-semibold text-muted uppercase font-devanagari-body tracking-wider">
                  <th className="p-4 w-16">क्रम</th>
                  <th className="p-4">फोटो</th>
                  <th className="p-4">नाम व परिचय</th>
                  <th className="p-4">पद (Designation)</th>
                  <th className="p-4">स्थिति</th>
                  <th className="p-4 text-right">कार्य (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-300/80 text-xs font-devanagari-body">
                {members.map((member, index) => (
                  <tr key={member._id} className="hover:bg-cream-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-maroon-900">
                      <div className="flex items-center gap-1">
                        <span>{member.displayOrder || index + 1}</span>
                        <div className="flex flex-col">
                          <button
                            onClick={() => handleMoveOrder(index, 'up')}
                            disabled={index === 0}
                            className="text-muted hover:text-dark-900 disabled:opacity-30 p-0.5"
                            title="ऊपर ले जाएं"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleMoveOrder(index, 'down')}
                            disabled={index === members.length - 1}
                            className="text-muted hover:text-dark-900 disabled:opacity-30 p-0.5"
                            title="नीचे ले जाएं"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <img
                        src={getImageUrl(member.photoUrl)}
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover border border-gold-400/50"
                      />
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-dark-950 block text-sm">
                        {member.name}
                      </span>
                      {member.bio && (
                        <p className="text-[11px] text-muted line-clamp-1 max-w-sm">
                          {member.bio}
                        </p>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-maroon-900">
                      {member.designation}
                    </td>
                    <td className="p-4">
                      {member.isActive ? (
                        <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          सक्रिय
                        </span>
                      ) : (
                        <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-cream-300 text-muted">
                          निष्क्रिय
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(member)}
                          className="p-1.5 rounded-lg text-muted hover:text-maroon-800 hover:bg-cream-200"
                          title="संपादित करें"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(member._id)}
                          className="p-1.5 rounded-lg text-red-700 hover:bg-red-50"
                          title="हटाएं"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Member Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMember ? 'समिति सदस्य विवरण संपादित करें' : 'नया समिति सदस्य जोड़ें'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm font-devanagari-body">
          {/* Photo */}
          <div>
            <label className="block font-bold text-dark-900 mb-1.5">
              सदस्य का फोटो *
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-cream-200 border border-gold-400 overflow-hidden flex items-center justify-center shrink-0">
                {photoPreview ? (
                  <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-muted" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="text-xs text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cream-300 file:text-dark-900 hover:file:bg-cream-400"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-dark-900 mb-1">
              सदस्य का नाम *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="उदा. श्री रामेश्वर यादव"
              className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-maroon-600"
            />
          </div>

          <div>
            <label className="block font-bold text-dark-900 mb-1">
              पद (Designation) *
            </label>
            <input
              type="text"
              required
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="उदा. अध्यक्ष (President) / सचिव"
              className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-maroon-600"
            />
          </div>

          <div>
            <label className="block font-bold text-dark-900 mb-1">
              संक्षिप्त परिचय / दायित्व (Bio)
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="पूजा व्यवस्था, सांस्कृतिक समन्वय आदि..."
              maxLength={400}
              className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-maroon-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-bold text-dark-900 mb-1">
                प्रदर्शन क्रम (Display Order)
              </label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2 rounded-xl border border-cream-300 bg-cream-50 text-dark-900 text-xs focus:outline-none focus:ring-2 focus:ring-maroon-600"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-maroon-700 focus:ring-maroon-500 w-4 h-4"
                />
                <span className="font-bold text-dark-900">सक्रिय सदस्य</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-cream-300">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsModalOpen(false)}
            >
              रद्द करें
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
            >
              {editingMember ? 'अपडेट करें' : 'जोड़ें'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="समिति सदस्य हटाने की पुष्टि"
      >
        <div className="space-y-4">
          <p className="text-sm font-devanagari-body text-dark-800 leading-relaxed">
            क्या आप वाकई इस समिति सदस्य को हटाना चाहते हैं?
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-cream-300">
            <Button variant="outline" size="md" onClick={() => setDeletingId(null)}>
              रद्द करें
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              हाँ, हटा दें
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
