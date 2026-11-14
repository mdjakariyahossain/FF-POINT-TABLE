import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Download } from 'lucide-react';
import { PosterDesignConfig, PosterHeader, TeamRow } from '../types/pointTable';
import { renderPointTablePoster } from '../utils/canvasPoster';

interface PosterPreviewProps {
  header: PosterHeader;
  teams: TeamRow[];
  design: PosterDesignConfig;
  bgImage: HTMLImageElement | null;
  onExportPng: (scale: 1 | 2) => void;
  lastSavedFilename: string | null;
  isExporting: boolean;
}

export const PosterPreview: React.FC<PosterPreviewProps> = ({
  header,
  teams,
  design,
  bgImage,
  onExportPng,
  lastSavedFilename,
  isExporting,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    if (document.fonts && document.fonts.ready) {
      Promise.all([
        document.fonts.load('400 72px "Anton"').catch(() => undefined),
        document.fonts.load('700 64px "Dancing Script"').catch(() => undefined),
        document.fonts.load('400 82px "Great Vibes"').catch(() => undefined),
        document.fonts.load('800 20px "Plus Jakarta Sans"').catch(() => undefined),
        document.fonts.ready,
      ]).then(() => {
        if (active) setFontsLoaded(true);
      });
    } else {
      setFontsLoaded(true);
    }
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    renderPointTablePoster({
      canvas,
      header,
      teams,
      design,
      bgImage,
      pixelScale: 2,
    });
  }, [header, teams, design, bgImage, fontsLoaded]);

  return (
    <div id="poster-preview" className="flex flex-col items-center w-full">
      <div className="w-full max-w-[640px] flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Live Point Table Poster</h2>
          <p className="text-xs text-slate-500">
            1080 × 1080 square · 2160px HD export ready
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onExportPng(1)}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>1080px PNG</span>
          </button>

          <button
            type="button"
            onClick={() => onExportPng(2)}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>2160px HD PNG</span>
          </button>
        </div>
      </div>

      <div className="w-full max-w-[640px] aspect-square bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <canvas
          ref={canvasRef}
          data-testid="poster-preview-canvas"
          aria-label={`Point table poster preview for ${header.tournamentName}`}
          className="w-full h-full block"
        />
      </div>

      {lastSavedFilename && (
        <div
          role="status"
          className="w-full max-w-[640px] mt-3 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs font-medium text-emerald-800"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
          <span>Saved PNG to your device: {lastSavedFilename}</span>
        </div>
      )}
    </div>
  );
};
