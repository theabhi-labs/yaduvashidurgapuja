import React, { useEffect, useState } from 'react';
import { committeeService } from '../services/committeeService';
import { CommitteeMember } from '../types';
import { CommitteeCard } from '../components/committee/CommitteeCard';
import { SectionHeading } from '../components/common/SectionHeading';
import { CommitteeCardSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Users } from 'lucide-react';

export const Committee: React.FC = () => {
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommittee = async () => {
      setIsLoading(true);
      try {
        const res = await committeeService.getCommittee();
        if (res.success) {
          setMembers(res.data);
        }
      } catch (err: any) {
        setError(err.message || 'समिति सदस्यों की सूची लोड करने में त्रुटि हुई');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommittee();
  }, []);

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[85vh]">
      <SectionHeading
        badge="पूजा संरक्षक एवं सेवादार"
        title="यदुवंशी दुर्गा पूजा समिति, कपूरिपुर"
        subtitle="माँ जगदम्बा की पावन सेवा, पंडाल व्यवस्था, सांस्कृतिक कार्यक्रम और सम्पूर्ण आयोजन को दशकों से निष्ठापूर्वक संचालित करने वाली कार्यकारिणी समिति।"
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <CommitteeCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center p-8 bg-maroon-50 rounded-2xl border border-maroon-200 max-w-md mx-auto">
          <p className="text-sm font-devanagari-body text-maroon-900">{error}</p>
        </div>
      ) : members.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8 text-gold-600" />}
          title="समिति सदस्य सूची अद्यतन की जा रही है"
          description="शीघ्र ही नवीन कार्यकारिणी सूची यहाँ उपलब्ध होगी।"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {members.map((member) => (
            <CommitteeCard key={member._id} member={member} />
          ))}
        </div>
      )}
    </div>
  );
};
