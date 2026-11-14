import React, { useRef, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  FileUp,
  HardDriveDownload,
  Upload,
} from 'lucide-react';
import { SavedDesign } from '../types/pointTable';
import {
  downloadBackupFile,
  parseAndValidateBackupJson,
  PointTableBackupV1,
} from '../utils/backup';
import { MATCH_ANALYSIS_PROMPT } from '../utils/promptText';
import { WorkspaceState } from '../utils/storage';

interface BackupAndAppPanelProps {
  workspace: WorkspaceState;
  savedDesigns: SavedDesign[];
  onRestoreBackup: (backup: PointTableBackupV1) => void;
}

export const BackupAndAppPanel: React.FC<BackupAndAppPanelProps> = ({
  workspace,
  savedDesigns,
  onRestoreBackup,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'ok' | 'err';
    text: string;
  } | null>(null);
  const [promptCopied, setPromptCopied] = useState(false);

  const handleExportBackup = () => {
    try {
      const filename = downloadBackupFile(workspace, savedDesigns);
      setStatusMessage({
        type: 'ok',
        text: `Backup saved to device storage: ${filename}`,
      });
    } catch {
      setStatusMessage({
        type: 'err',
        text: 'Could not export backup file.',
      });
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseAndValidateBackupJson(text);
      if (!parsed.ok) {
        setStatusMessage({ type: 'err', text: parsed.error });
      } else {
        onRestoreBackup(parsed.data);
        setStatusMessage({ type: 'ok', text: parsed.summary });
      }
    } catch {
      setStatusMessage({
        type: 'err',
        text: 'Failed to read the selected backup file.',
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(MATCH_ANALYSIS_PROMPT);
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2000);
    } catch {
      // Fallback copy via temporary textarea
      const ta = document.createElement('textarea');
      ta.value = MATCH_ANALYSIS_PROMPT;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2000);
    }
  };

  const crownCount = workspace.teams.filter((t) => t.hasCrown).length;
  const cupCount = workspace.teams.filter((t) => t.hasCup).length;

  return (
    <div className="space-y-6">
      {/* 1. Export & Import Project Backup */}
      <section className="space-y-3" aria-label="Project Backup and Restore">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Export &amp; Import Project Backup
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Save your entire point table project (all 12 teams, scores, crowns, cups, headings, custom background, and saved designs) as a backup file in your device storage so you can reload and edit it anytime later.
          </p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
          <span>
            Current project: <strong className="text-slate-900">{workspace.header.tournamentName || 'Untitled'}</strong>
          </span>
          <span className="text-slate-500">
            12 teams · {crownCount} crowns · {cupCount} cups · {savedDesigns.length} saved design{savedDesigns.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleExportBackup}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <HardDriveDownload className="w-4 h-4" aria-hidden="true" />
            <span>Export Backup (.json)</span>
          </button>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportFile}
              className="hidden"
              id="import-backup-input"
              aria-label="Import Backup File"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" aria-hidden="true" />
              <span>Import Backup (.json)</span>
            </button>
          </div>
        </div>

        {statusMessage && (
          <div
            role={statusMessage.type === 'err' ? 'alert' : 'status'}
            className={`px-3 py-2.5 rounded-lg border text-xs font-medium flex items-start gap-2 ${
              statusMessage.type === 'err'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            {statusMessage.type === 'ok' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
            ) : (
              <FileUp className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </section>

      <hr className="border-slate-200" />

      {/* 2. Match Screenshot Analysis Prompt with Copy Button */}
      <section className="space-y-3" aria-label="Match Scoreboard Prompt">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Match Result Analysis Prompt
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Copy this prompt with one click to extract match results ready for Google Sheets.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopyPrompt}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {promptCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Copy Prompt</span>
              </>
            )}
          </button>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
          <pre
            data-testid="match-analysis-prompt-text"
            className="whitespace-pre-wrap break-words font-sans text-xs text-slate-800 leading-relaxed select-all"
          >
            {MATCH_ANALYSIS_PROMPT}
          </pre>
        </div>
      </section>
    </div>
  );
};
