import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

export const LanguageSwitch: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      <Button
        variant={language === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('en')}
        className="h-7 px-3 text-xs font-medium"
      >
        EN
      </Button>
      <Button
        variant={language === 'ta' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('ta')}
        className="h-7 px-3 text-xs font-tamil"
      >
        தமிழ்
      </Button>
    </div>
  );
};
