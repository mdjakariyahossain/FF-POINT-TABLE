import React from 'react';
import { ArrowUpDown, ClipboardPaste, Eraser, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { TeamRow } from '../types/pointTable';
import { MAX_TABLE_SLOTS } from '../utils/sheetParser';
import { CrownVectorIcon, CupVectorIcon } from './Icons';

interface TeamsEditorPanelProps {
  teams: TeamRow[];
  footerText: string;
  crownColor: string;
  cupColor: string;
  autoSort: boolean;
  autoCalculateTotal: boolean;
  onUpdateTeam: (index: number, patch: Partial<TeamRow>) => void;
  onToggleCrown: (index: number) => void;
  onToggleCup: (index: number) => void;
  onAddTeam: () => void;
  onRemoveTeam: (index: number) => void;
  onChangeFooterText: (value: string) => void;
  onSortNow: () => void;
  onClearAwards: () => void;
  onResetTeams: () => void;
  onOpenPasteTab: () => void;
  onToggleAutoSort: (value: boolean) => void;
  onToggleAutoCalculateTotal: (value: boolean) => void;
}

export const TeamsEditorPanel: React.FC<TeamsEditorPanelProps> = ({
  teams,
  footerText,
  crownColor,
  cupColor,
  autoSort,
  autoCalculateTotal,
  onUpdateTeam,
  onToggleCrown,
  onToggleCup,
  onAddTeam,
  onRemoveTeam,
  onChangeFooterText,
  onSortNow,
  onClearAwards,
  onResetTeams,
  onOpenPasteTab,
  onToggleAutoSort,
  onToggleAutoCalculateTotal,
}) => {
  const crownCount = teams.filter((t) => t.hasCrown).length;
  const cupCount = teams.filter((t) => t.hasCup).length;

  return (
    <section className="space-y-4" aria-label="Point Table Data and Awards">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            {teams.length}-Team Standings &amp; Awards
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {crownCount} Crown{crownCount === 1 ? '' : 's'} · {cupCount} Cup{cupCount === 1 ? '' : 's'} assigned across {teams.length} team{teams.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenPasteTab}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ClipboardPaste className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Paste Google Sheet</span>
          </button>
          <button
            type="button"
            onClick={onAddTeam}
            disabled={teams.length >= MAX_TABLE_SLOTS}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-45 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Add Team</span>
          </button>
          <button
            type="button"
            onClick={onSortNow}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Sort Ranks</span>
          </button>
          <button
            type="button"
            onClick={onClearAwards}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Eraser className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Clear Awards</span>
          </button>
          <button
            type="button"
            onClick={onResetTeams}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-5 py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={autoSort}
            onChange={(e) => onToggleAutoSort(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
          />
          <span className="font-medium">Auto-sort ranks by Total Points</span>
        </label>

        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={autoCalculateTotal}
            onChange={(e) => onToggleAutoCalculateTotal(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
          />
          <span className="font-medium">Auto-sum Total (Placement + Finish)</span>
        </label>
      </div>

      <div className="border border-slate-200 rounded-lg bg-white overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[560px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-2.5 pl-3 pr-2 w-12">Rank</th>
              <th className="py-2.5 px-2">Team Name</th>
              <th className="py-2.5 px-1.5 w-14 text-center">Win</th>
              <th className="py-2.5 px-1.5 w-16 text-center">Place</th>
              <th className="py-2.5 px-1.5 w-16 text-center">Finish</th>
              <th className="py-2.5 px-1.5 w-16 text-center">Total</th>
              <th className="py-2.5 pl-2 pr-3 w-28 text-center">Awards</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {teams.map((team, index) => {
              const rankStr = String(index + 1).padStart(2, '0');
              const isTop4 = index < 4;

              return (
                <tr
                  key={team.id}
                  data-testid={`team-editor-row-${index + 1}`}
                  className={`transition-colors hover:bg-slate-50/80 ${
                    isTop4 ? 'bg-slate-50/40' : 'bg-white'
                  }`}
                >
                  <td className="py-1.5 pl-3 pr-2">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded text-xs font-bold font-mono-num ${
                        isTop4
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {rankStr}
                    </span>
                  </td>

                  <td className="py-1.5 px-2">
                    <input
                      type="text"
                      value={team.name}
                      aria-label={`Team ${rankStr} Name`}
                      onChange={(e) => onUpdateTeam(index, { name: e.target.value })}
                      className="w-full px-2 py-1 text-xs font-semibold text-slate-900 bg-transparent border border-transparent hover:border-slate-200 focus:border-slate-400 focus:bg-white rounded focus:outline-none transition-colors"
                    />
                  </td>

                  <td className="py-1.5 px-1">
                    <input
                      type="number"
                      min={0}
                      value={team.win}
                      aria-label={`Team ${rankStr} Win`}
                      onChange={(e) =>
                        onUpdateTeam(index, { win: Math.max(0, Number(e.target.value) || 0) })
                      }
                      className="w-full px-1.5 py-1 text-center text-xs font-semibold font-mono-num text-slate-900 bg-transparent border border-transparent hover:border-slate-200 focus:border-slate-400 focus:bg-white rounded focus:outline-none"
                    />
                  </td>

                  <td className="py-1.5 px-1">
                    <input
                      type="number"
                      min={0}
                      value={team.placement}
                      aria-label={`Team ${rankStr} Placement Point`}
                      onChange={(e) =>
                        onUpdateTeam(index, { placement: Math.max(0, Number(e.target.value) || 0) })
                      }
                      className="w-full px-1.5 py-1 text-center text-xs font-semibold font-mono-num text-slate-900 bg-transparent border border-transparent hover:border-slate-200 focus:border-slate-400 focus:bg-white rounded focus:outline-none"
                    />
                  </td>

                  <td className="py-1.5 px-1">
                    <input
                      type="number"
                      min={0}
                      value={team.finish}
                      aria-label={`Team ${rankStr} Finish Point`}
                      onChange={(e) =>
                        onUpdateTeam(index, { finish: Math.max(0, Number(e.target.value) || 0) })
                      }
                      className="w-full px-1.5 py-1 text-center text-xs font-semibold font-mono-num text-slate-900 bg-transparent border border-transparent hover:border-slate-200 focus:border-slate-400 focus:bg-white rounded focus:outline-none"
                    />
                  </td>

                  <td className="py-1.5 px-1">
                    <input
                      type="number"
                      min={0}
                      value={autoCalculateTotal ? team.placement + team.finish : team.total}
                      disabled={autoCalculateTotal}
                      aria-label={`Team ${rankStr} Total Point`}
                      onChange={(e) =>
                        onUpdateTeam(index, { total: Math.max(0, Number(e.target.value) || 0) })
                      }
                      className={`w-full px-1.5 py-1 text-center text-xs font-bold font-mono-num rounded focus:outline-none ${
                        autoCalculateTotal
                          ? 'text-slate-500 bg-slate-50 border border-transparent cursor-not-allowed'
                          : 'text-slate-900 bg-transparent border border-transparent hover:border-slate-200 focus:border-slate-400 focus:bg-white'
                      }`}
                    />
                  </td>

                  <td className="py-1.5 pl-2 pr-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => onToggleCrown(index)}
                        aria-pressed={team.hasCrown}
                        aria-label={`Toggle Crown for Rank ${rankStr} ${team.name}`}
                        title={`Toggle Crown for ${team.name}`}
                        className={`w-7 h-7 inline-flex items-center justify-center rounded-md border transition-all cursor-pointer ${
                          team.hasCrown
                            ? 'bg-slate-900/10 border-slate-900 ring-1 ring-slate-900/20'
                            : 'bg-white border-slate-200 opacity-45 hover:opacity-100 hover:border-slate-300'
                        }`}
                      >
                        <CrownVectorIcon color={crownColor} size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleCup(index)}
                        aria-pressed={team.hasCup}
                        aria-label={`Toggle Cup for Rank ${rankStr} ${team.name}`}
                        title={`Toggle Cup for ${team.name}`}
                        className={`w-7 h-7 inline-flex items-center justify-center rounded-md border transition-all cursor-pointer ${
                          team.hasCup
                            ? 'bg-red-50 border-red-500 ring-1 ring-red-500/20'
                            : 'bg-white border-slate-200 opacity-45 hover:opacity-100 hover:border-slate-300'
                        }`}
                      >
                        <CupVectorIcon color={cupColor} size={15} />
                      </button>

                      {teams.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onRemoveTeam(index)}
                          aria-label={`Remove Rank ${rankStr} ${team.name}`}
                          title={`Remove ${team.name}`}
                          className="w-6 h-7 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
        <label htmlFor="teams-footer-text" className="block text-xs font-semibold text-slate-700 mb-1">
          Point Table Footer Text (Optional)
        </label>
        <input
          id="teams-footer-text"
          type="text"
          value={footerText}
          onChange={(e) => onChangeFooterText(e.target.value)}
          placeholder="e.g. ORGANIZED BY FF ESPORTS · LIVE ON YOUTUBE"
          className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-slate-900"
        />
      </div>
    </section>
  );
};
