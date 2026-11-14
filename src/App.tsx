import { useEffect, useState } from 'react';
import { PosterDesignConfig, PosterHeader, SavedDesign, TeamRow } from './types/pointTable';
import { createDefaultTeams, MAX_TABLE_SLOTS, recalculateAndSortTeams } from './utils/sheetParser';
import { exportPosterPng } from './utils/canvasPoster';
import {
  deleteSavedDesign,
  loadSavedDesigns,
  loadWorkspaceState,
  saveCustomDesign,
  saveSavedDesigns,
  saveWorkspaceState,
} from './utils/storage';
import { PointTableBackupV1 } from './utils/backup';
import { getPremiumBackgroundById } from './utils/premiumBackgrounds';
import { StudioTab, TopBar } from './components/TopBar';
import { TeamsEditorPanel } from './components/TeamsEditorPanel';
import { SheetPastePanel } from './components/SheetPastePanel';
import { DesignPanel } from './components/DesignPanel';
import { BackupAndAppPanel } from './components/BackupAndAppPanel';
import { PosterPreview } from './components/PosterPreview';

export default function App() {
  const [initial] = useState(() => loadWorkspaceState());
  const [header, setHeader] = useState<PosterHeader>(initial.header);
  const [teams, setTeams] = useState<TeamRow[]>(initial.teams);
  const [design, setDesign] = useState<PosterDesignConfig>(initial.design);
  const [autoSort, setAutoSort] = useState<boolean>(initial.autoSort);
  const [autoCalculateTotal, setAutoCalculateTotal] = useState<boolean>(
    initial.autoCalculateTotal
  );
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>(() =>
    loadSavedDesigns()
  );

  const [activeTab, setActiveTab] = useState<StudioTab>('teams');
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [lastSavedFilename, setLastSavedFilename] = useState<string | null>(null);

  // Sync workspace changes to localStorage
  useEffect(() => {
    saveWorkspaceState({
      header,
      teams,
      design,
      autoSort,
      autoCalculateTotal,
    });
  }, [header, teams, design, autoSort, autoCalculateTotal]);

  // Preload custom or premium background image element when bgMode changes
  useEffect(() => {
    let imageSrc: string | null = null;
    if (design.bgMode === 'custom-image' && design.customBgDataUrl) {
      imageSrc = design.customBgDataUrl;
    } else if (design.bgMode === 'premium-image') {
      imageSrc = getPremiumBackgroundById(design.premiumBgId)?.imageUrl ?? null;
    }

    if (!imageSrc) {
      setBgImage(null);
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setBgImage(img);
    };
    img.onerror = () => {
      if (!cancelled) setBgImage(null);
    };
    img.src = imageSrc;
    return () => {
      cancelled = true;
    };
  }, [design.bgMode, design.customBgDataUrl, design.premiumBgId]);

  const handleUpdateTeam = (index: number, patch: Partial<TeamRow>) => {
    setTeams((prev) => {
      const updated = prev.map((t, i) => {
        if (i !== index) return t;
        const merged = { ...t, ...patch };
        if (autoCalculateTotal) {
          merged.total = merged.placement + merged.finish;
        }
        return merged;
      });
      return updated;
    });
  };

  const handleToggleCrown = (index: number) => {
    setTeams((prev) =>
      prev.map((t, i) => (i === index ? { ...t, hasCrown: !t.hasCrown } : t))
    );
  };

  const handleToggleCup = (index: number) => {
    setTeams((prev) =>
      prev.map((t, i) => (i === index ? { ...t, hasCup: !t.hasCup } : t))
    );
  };

  const handleSortNow = () => {
    setTeams((prev) => recalculateAndSortTeams(prev, true, autoCalculateTotal));
  };

  const handleClearAwards = () => {
    setTeams((prev) => prev.map((t) => ({ ...t, hasCrown: false, hasCup: false })));
  };

  const handleResetTeams = () => {
    setTeams(createDefaultTeams());
  };

  const handleAddTeam = () => {
    setTeams((prev) => {
      if (prev.length >= MAX_TABLE_SLOTS) return prev;
      const rank = prev.length + 1;
      return [
        ...prev,
        {
          id: `team-${rank}-${Date.now()}`,
          rank,
          name: `TEAM ${rank}`,
          win: 0,
          placement: 0,
          finish: 0,
          total: 0,
          hasCrown: false,
          hasCup: false,
        },
      ];
    });
  };

  const handleRemoveTeam = (index: number) => {
    setTeams((prev) => {
      if (prev.length <= 1) return prev;
      return prev
        .filter((_, i) => i !== index)
        .map((t, idx) => ({ ...t, rank: idx + 1 }));
    });
  };

  const handleToggleAutoSort = (value: boolean) => {
    setAutoSort(value);
    if (value) {
      setTeams((prev) => recalculateAndSortTeams(prev, true, autoCalculateTotal));
    }
  };

  const handleToggleAutoCalculateTotal = (value: boolean) => {
    setAutoCalculateTotal(value);
    setTeams((prev) => recalculateAndSortTeams(prev, autoSort, value));
  };

  const handleApplyParsedTeams = (parsedTeams: TeamRow[]) => {
    setTeams(parsedTeams);
    setActiveTab('teams');
  };

  const handleChangeHeader = (patch: Partial<PosterHeader>) => {
    setHeader((prev) => ({ ...prev, ...patch }));
  };

  const handleChangeDesign = (patch: Partial<PosterDesignConfig>) => {
    setDesign((prev) => ({ ...prev, ...patch }));
  };

  const handleSaveDesign = (name: string) => {
    const res = saveCustomDesign(name, design, header);
    setSavedDesigns(res.designs);
    return { error: res.error };
  };

  const handleApplySavedDesign = (saved: SavedDesign) => {
    setDesign({ ...saved.config });
    if (saved.header) {
      setHeader({ ...saved.header });
    }
  };

  const handleDeleteSavedDesign = (id: string) => {
    setSavedDesigns(deleteSavedDesign(id));
  };

  const handleExportPng = async (scale: 1 | 2 = 2) => {
    setIsExporting(true);
    try {
      const filename = await exportPosterPng(header, teams, design, bgImage, scale);
      setLastSavedFilename(filename);
    } finally {
      setIsExporting(false);
    }
  };

  const handleRestoreBackup = (backup: PointTableBackupV1) => {
    setHeader(backup.workspace.header);
    setTeams(backup.workspace.teams);
    setDesign(backup.workspace.design);
    setAutoSort(backup.workspace.autoSort);
    setAutoCalculateTotal(backup.workspace.autoCalculateTotal);
    setSavedDesigns(backup.savedDesigns);
    saveSavedDesigns(backup.savedDesigns);
  };

  return (
    <div id="top" className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onDownloadPng={() => handleExportPng(2)}
        isExporting={isExporting}
      />

      {/* Mobile Tab Bar */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          {(
            [
              { id: 'teams', label: 'Teams & Awards' },
              { id: 'paste', label: 'Paste Sheet' },
              { id: 'design', label: 'Design & BG' },
              { id: 'backup', label: 'Backup & Prompt' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <a
          href="#poster-preview"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 whitespace-nowrap shrink-0 pl-2"
        >
          Preview ↓
        </a>
      </div>

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Studio Controls */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
          {activeTab === 'teams' && (
            <TeamsEditorPanel
              teams={teams}
              footerText={header.footerText ?? ''}
              crownColor={design.crownColor}
              cupColor={design.cupColor}
              autoSort={autoSort}
              autoCalculateTotal={autoCalculateTotal}
              onUpdateTeam={handleUpdateTeam}
              onToggleCrown={handleToggleCrown}
              onToggleCup={handleToggleCup}
              onAddTeam={handleAddTeam}
              onRemoveTeam={handleRemoveTeam}
              onChangeFooterText={(value) => handleChangeHeader({ footerText: value })}
              onSortNow={handleSortNow}
              onClearAwards={handleClearAwards}
              onResetTeams={handleResetTeams}
              onOpenPasteTab={() => setActiveTab('paste')}
              onToggleAutoSort={handleToggleAutoSort}
              onToggleAutoCalculateTotal={handleToggleAutoCalculateTotal}
            />
          )}

          {activeTab === 'paste' && (
            <SheetPastePanel
              existingTeams={teams}
              autoSort={autoSort}
              autoCalculateTotal={autoCalculateTotal}
              onToggleAutoSort={handleToggleAutoSort}
              onToggleAutoCalculateTotal={handleToggleAutoCalculateTotal}
              onApplyParsedTeams={handleApplyParsedTeams}
            />
          )}

          {activeTab === 'design' && (
            <DesignPanel
              header={header}
              design={design}
              savedDesigns={savedDesigns}
              onChangeHeader={handleChangeHeader}
              onChangeDesign={handleChangeDesign}
              onSaveDesign={handleSaveDesign}
              onApplySavedDesign={handleApplySavedDesign}
              onDeleteSavedDesign={handleDeleteSavedDesign}
            />
          )}

          {activeTab === 'backup' && (
            <BackupAndAppPanel
              workspace={{
                header,
                teams,
                design,
                autoSort,
                autoCalculateTotal,
              }}
              savedDesigns={savedDesigns}
              onRestoreBackup={handleRestoreBackup}
            />
          )}
        </div>

        {/* Right Live Poster Canvas Preview */}
        <div className="lg:col-span-6 lg:sticky lg:top-6 flex justify-center">
          <PosterPreview
            header={header}
            teams={teams}
            design={design}
            bgImage={bgImage}
            onExportPng={handleExportPng}
            lastSavedFilename={lastSavedFilename}
            isExporting={isExporting}
          />
        </div>
      </main>
    </div>
  );
}
