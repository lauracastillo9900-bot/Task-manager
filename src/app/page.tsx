'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Calendar from '@/components/Calendar/Calendar';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import { useTask } from '@/context/TaskContext';
import { useTranslation } from '@/context/LocaleContext';

export default function Home() {
  const { openModal } = useTask();
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      <header className="border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Task Calendar
            </h1>

            <div className="flex items-center gap-1.5">
              <LanguageSwitcher />
              <ThemeToggle />
              <button
                onClick={() => openModal()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {!isMobile && <span>{t('common.newTask')}</span>}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Calendar />
      </main>
    </div>
  );
}
