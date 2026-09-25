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
        setError(err.message || 'Error loading committee members');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommittee();
  }, []);

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[85vh]">
      <SectionHeading
        badge="Seva & Leadership"
        title="Yaduvashi Durga Puja Committee, Kapooripur"
        subtitle="The executive committee and seva volunteers dedicated to organizing holy rituals, pandal arrangements, and cultural traditions with devotion."
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <CommitteeCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center p-8 bg-maroon-50 rounded-2xl border border-maroon-200 max-w-md mx-auto">
          <p className="text-sm font-body text-maroon-900">{error}</p>
        </div>
      ) : members.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8 text-gold-600" />}
          title="Committee Member List Being Updated"
          description="The updated executive committee member directory will be available here shortly."
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
