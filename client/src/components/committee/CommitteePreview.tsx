import React from 'react';
import { Link } from 'react-router-dom';
import { CommitteeMember } from '../../types';
import { CommitteeCard } from './CommitteeCard';
import { SectionHeading } from '../common/SectionHeading';
import { Button } from '../common/Button';
import { CommitteeCardSkeleton } from '../common/LoadingSkeleton';
import { ArrowRight } from 'lucide-react';

interface CommitteePreviewProps {
  members: CommitteeMember[];
  isLoading: boolean;
}

export const CommitteePreview: React.FC<CommitteePreviewProps> = ({ members, isLoading }) => {
  return (
    <section className="py-16 sm:py-20 bg-cream-100/60 border-y border-cream-300/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="पूजा समिति के सेवादार"
          title="समिति के समर्पित स्तंभ"
          subtitle="वे निष्ठावान सेवादार जो पूर्ण समर्पण, सेवा भाव और अटूट निष्ठा के साथ कपूरिपुर दुर्गा पूजा की पावन परंपरा का निर्वहन करते हैं।"
        />

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <CommitteeCardSkeleton />
            <CommitteeCardSkeleton />
            <CommitteeCardSkeleton />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {members.slice(0, 3).map((member) => (
                <CommitteeCard key={member._id} member={member} />
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link to="/committee">
                <Button
                  variant="outline"
                  size="md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  सभी समिति सदस्यों को देखें
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
