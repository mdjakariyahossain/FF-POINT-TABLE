import React, { useMemo, useState } from 'react';
import { Check, FileSpreadsheet, Sparkles } from 'lucide-react';
import { TeamRow } from '../types/pointTable';
import {
  parseGoogleSheetText,
  SAMPLE_GOOGLE_SHEET_TSV,
} from '../utils/sheetParser';

interface SheetPastePanelProps {
  existingTeams: TeamRow[];
  autoSort: boolean;
  autoCalculateTotal: boolean;
  onToggleAutoSort: (value: boolean) => void;
  onToggleAutoCalculateTotal: (value: boolean) => void;
  onApplyParsedTeams: (teams: TeamRow[]) => void;
}

export const SheetPastePanel: React.FC<SheetPastePanelProps> = ({
  existingTeams,
  autoSort,
  autoCalculateTotal,
  onToggleAutoSort,
  onToggleAutoCalculateTotal,
  onApplyParsedTeams,
}) => {
  const [rawText, setRawText] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const parsed = useMemo(() => {
    if (!rawText.trim()) return null;
    return parseGoogleSheetText(
      rawText,
      { autoSort, autoCalculateTotal },
      existingTeams
    );
  }, [rawText, autoSort, autoCalculateTotal, existingTeams]);

  const handleLoadSample = () => {
    setRawText(SAMPLE_GOOGLE_SHEET_TSV);
    setValidationError(null);
  };

  const handleApply = () => {
    if (!rawText.trim()) {
      setValidationError('Paste your Google Sheet rows first, or load the sample match data.');
      return;
    }
    const result = parseGoogleSheetText(
      rawText,
      { autoSort, autoCalculateTotal },
      existingTeams
    );
    if (result.parsedCount === 0) {
      setValidationError(result.warnings[0] ?? 'No team rows were detected in the pasted text.');
      return;
    }
    setValidationError(null);
    onApplyParsedTeams(result.teams);
  };

  return (
    <section className="space-y-4" aria-label="Google Sheets Import">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Import from Google Sheets</h2>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Select cells in Google Sheets, copy (<kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px]">Ctrl+C</kbd>), and paste below. Only the exact teams you paste will appear on the point table (no extra empty slots).
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadSample}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Load Sample Match</span>
        </button>
      </div>

      <div>
        <label htmlFor="google-sheet-paste-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
          Google Sheets Copy-Paste Area
        </label>
        <textarea
          id="google-sheet-paste-input"
          value={rawText}
          onChange={(e) => {
            setRawText(e.target.value);
            if (validationError) setValidationError(null);
          }}
          rows={8}
          placeholder={`Paste copied Google Sheet rows here...\n\nExample:\nRANK\tTEAM NAME\tWIN\tPLACEMENT POINT\tFINISH POINT\tTOTAL POINT\n1\tTEAM PHOENIX\t3\t36\t42\t78\n2\tSHADOW ELITE\t2\t30\t35\t65`}
          className="w-full p-3 text-xs font-mono-num text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-900 resize-y"
        />
      </div>

      {validationError && (
        <div
          role="alert"
          className="px-3 py-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md"
        >
          {validationError}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-lg">
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoSort}
              onChange={(e) => onToggleAutoSort(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-slate-900"
            />
            <span className="font-medium">Auto-rank by Total Points</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoCalculateTotal}
              onChange={(e) => onToggleAutoCalculateTotal(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-slate-900"
            />
            <span className="font-medium">Auto-sum Placement + Finish</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          {rawText && (
            <button
              type="button"
              onClick={() => {
                setRawText('');
                setValidationError(null);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={handleApply}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Apply to Point Table</span>
          </button>
        </div>
      </div>

      {parsed && parsed.parsedCount > 0 && (
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
              <span>Preview: {parsed.parsedCount} team{parsed.parsedCount === 1 ? '' : 's'} detected</span>
            </span>
            <span className="text-slate-500">{parsed.detectedFormat}</span>
          </div>

          {parsed.warnings.length > 0 && (
            <div className="px-3 py-1.5 bg-amber-50 border-b border-amber-200 text-xs text-amber-800">
              {parsed.warnings[0]}
            </div>
          )}

          <div className="max-h-60 overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-100">
                <tr>
                  <th className="py-1.5 pl-3 pr-2 w-12">Rank</th>
                  <th className="py-1.5 px-2">Team Name</th>
                  <th className="py-1.5 px-2 text-right">Win</th>
                  <th className="py-1.5 px-2 text-right">Place</th>
                  <th className="py-1.5 px-2 text-right">Finish</th>
                  <th className="py-1.5 pl-2 pr-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsed.teams.map((row) => (
                  <tr key={row.id}>
                    <td className="py-1.5 pl-3 pr-2 font-mono-num font-bold text-slate-600">
                      {String(row.rank).padStart(2, '0')}
                    </td>
                    <td className="py-1.5 px-2 font-semibold text-slate-900">{row.name}</td>
                    <td className="py-1.5 px-2 text-right font-mono-num">{row.win}</td>
                    <td className="py-1.5 px-2 text-right font-mono-num">{row.placement}</td>
                    <td className="py-1.5 px-2 text-right font-mono-num">{row.finish}</td>
                    <td className="py-1.5 pl-2 pr-3 text-right font-mono-num font-bold text-slate-900">
                      {row.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};
