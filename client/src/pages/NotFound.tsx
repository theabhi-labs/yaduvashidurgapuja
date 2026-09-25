import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center p-4">
      <div className="w-20 h-20 rounded-3xl bg-maroon-700 text-gold-400 flex items-center justify-center font-devanagari-heading font-black text-4xl mb-6 shadow-medium border-2 border-gold-500/40">
        ४०४
      </div>
      <h1 className="text-2xl sm:text-3xl font-devanagari-heading font-bold text-dark-950 mb-2">
        पृष्ठ नहीं मिला (Page Not Found)
      </h1>
      <p className="text-sm font-devanagari-body text-muted max-w-sm mb-8 leading-relaxed">
        क्षमा करें, आप जिस पृष्ठ को खोज रहे हैं वह उपलब्ध नहीं है या स्थानांतरित कर दिया गया है।
      </p>
      <Link to="/">
        <Button variant="primary" size="md" leftIcon={<Home className="w-4 h-4" />}>
          मुख्य पृष्ठ पर वापस जाएं
        </Button>
      </Link>
    </div>
  );
};
