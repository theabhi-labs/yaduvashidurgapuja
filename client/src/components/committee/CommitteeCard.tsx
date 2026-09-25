import React from 'react';
import { CommitteeMember } from '../../types';
import { getImageUrl } from '../../utils/helpers';
import { Award, User } from 'lucide-react';

interface CommitteeCardProps {
  member: CommitteeMember;
}

export const CommitteeCard: React.FC<CommitteeCardProps> = ({ member }) => {
  return (
    <div className="bg-cream-50 rounded-2xl border border-cream-300/80 p-6 flex flex-col items-center text-center shadow-soft hover:shadow-medium hover:border-gold-400/60 transition-all duration-300 group">
      {/* Portrait Photo */}
      <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden mb-4 border-2 border-gold-400/50 p-1 bg-cream-100 shadow-inner">
        <div className="w-full h-full rounded-full overflow-hidden bg-cream-200">
          {member.photoUrl ? (
            <img
              src={getImageUrl(member.photoUrl)}
              alt={member.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-maroon-700 bg-cream-300">
              <User className="w-12 h-12" />
            </div>
          )}
        </div>
      </div>

      {/* Member Details */}
      <h3 className="text-lg sm:text-xl font-devanagari-heading font-bold text-dark-950 mb-1">
        {member.name}
      </h3>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-maroon-50 border border-maroon-200 text-maroon-800 text-xs font-semibold font-devanagari-body mb-3">
        <Award className="w-3.5 h-3.5 text-maroon-700 shrink-0" />
        <span>{member.designation}</span>
      </div>

      {member.bio && (
        <p className="text-xs sm:text-sm font-devanagari-body text-muted leading-relaxed line-clamp-3 mt-1">
          {member.bio}
        </p>
      )}
    </div>
  );
};
