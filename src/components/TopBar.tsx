import React from 'react';
import { Download } from 'lucide-react';

export type StudioTab = 'teams' | 'paste' | 'design' | 'backup';

interface TopBarProps {
  activeTab: StudioTab;
  onSelectTab: (tab: StudioTab) => void;
  onDownloadPng: () => void;
  isExporting: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  onDownloadPng,
  isExporting,
}) => {
  const navItems: { id: StudioTab; label: string }[] = [
    { id: 'teams', label: 'Teams & Awards' },
    { id: 'paste', label: 'Paste Google Sheet' },
    { id: 'design', label: 'Design & Backgrounds' },
    { id: 'backup', label: 'Backup & Prompt' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between gap-8 shrink-0">
      <a
        href="#top"
        onClick={(e) => {
          e.preventDefault();
          onSelectTab('teams');
        }}
        className="text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
      >
        FF Point Studio
      </a>

      <nav className="hidden md:flex items-center gap-6" aria-label="Workspace Sections">
        {navItems.map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`py-2 text-sm font-semibold whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
                active
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={onDownloadPng}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          <span>{isExporting ? 'Exporting...' : 'Download PNG'}</span>
        </button>
      </div>
    </header>
  );
};
