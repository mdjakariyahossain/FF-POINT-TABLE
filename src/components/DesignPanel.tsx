import React, { useRef, useState } from 'react';
import { BookmarkPlus, ImagePlus, RotateCcw, Trash2, Upload } from 'lucide-react';
import {
  BackgroundMode,
  PosterDesignConfig,
  PosterHeader,
  SavedDesign,
  SubHeadingFontStyle,
} from '../types/pointTable';
import {
  createDefaultDesignConfig,
  DEFAULT_HEADER,
  deriveSyncedRowGradient,
  THEME_PRESETS,
} from '../utils/colorThemes';
import { PREMIUM_BACKGROUNDS, PremiumBackgroundPreset } from '../utils/premiumBackgrounds';
import { processUploadedBackgroundImage } from '../utils/storage';
import { CrownVectorIcon, CupVectorIcon } from './Icons';

interface DesignPanelProps {
  header: PosterHeader;
  design: PosterDesignConfig;
  savedDesigns: SavedDesign[];
  onChangeHeader: (patch: Partial<PosterHeader>) => void;
  onChangeDesign: (patch: Partial<PosterDesignConfig>) => void;
  onSaveDesign: (name: string) => { error?: string };
  onApplySavedDesign: (saved: SavedDesign) => void;
  onDeleteSavedDesign: (id: string) => void;
}

export const DesignPanel: React.FC<DesignPanelProps> = ({
  header,
  design,
  savedDesigns,
  onChangeHeader,
  onChangeDesign,
  onSaveDesign,
  onApplySavedDesign,
  onDeleteSavedDesign,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [designName, setDesignName] = useState('');
  const [saveMessage, setSaveMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleSelectPreset = (presetId: string) => {
    const preset = THEME_PRESETS.find((t) => t.id === presetId) ?? THEME_PRESETS[0];
    onChangeDesign({
      bgMode: 'preset',
      premiumBgId: null,
      themeId: preset.id,
      customGradientStart: preset.bgStart,
      customGradientMid: preset.bgMid,
      customGradientEnd: preset.bgEnd,
      customGradientAngle: preset.bgAngle,
      rowGradientStart: preset.topRowStart,
      rowGradientEnd: preset.topRowEnd,
      titleColor: preset.titleColor,
      bgOverlayOpacity: 0,
    });
  };

  const handleSelectPremiumBg = (premium: PremiumBackgroundPreset) => {
    onChangeDesign({
      bgMode: 'premium-image',
      premiumBgId: premium.id,
      rowGradientStart: premium.rowStart,
      rowGradientEnd: premium.rowEnd,
      titleColor: premium.titleColor,
      bgOverlayOpacity: premium.overlayOpacity,
      bgOverlayColor: premium.overlayColor,
    });
  };

  const handleBgModeChange = (mode: BackgroundMode) => {
    onChangeDesign({ bgMode: mode });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const processed = await processUploadedBackgroundImage(file);
      onChangeDesign({
        bgMode: 'custom-image',
        customBgDataUrl: processed.dataUrl,
        rowGradientStart: processed.rowStart,
        rowGradientEnd: processed.rowEnd,
        titleColor: processed.titleColor,
      });
      setSaveMessage(null);
    } catch (err) {
      setSaveMessage({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to load custom background image.',
      });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = onSaveDesign(designName);
    if (res.error) {
      setSaveMessage({ type: 'err', text: res.error });
    } else {
      setDesignName('');
      setSaveMessage({ type: 'ok', text: 'Custom design saved in app.' });
    }
  };

  const handleCustomGradientColor = (
    key: 'customGradientStart' | 'customGradientMid' | 'customGradientEnd',
    value: string
  ) => {
    const nextStart = key === 'customGradientStart' ? value : design.customGradientStart;
    const nextEnd = key === 'customGradientEnd' ? value : design.customGradientEnd;
    const patch: Partial<PosterDesignConfig> = {
      bgMode: 'custom-gradient',
      [key]: value,
    };
    if (design.autoSyncRowGradient) {
      const synced = deriveSyncedRowGradient(nextStart, nextEnd);
      patch.rowGradientStart = synced.rowStart;
      patch.rowGradientEnd = synced.rowEnd;
    }
    onChangeDesign(patch);
  };

  const subHeadingStyles: { id: SubHeadingFontStyle; label: string }[] = [
    { id: 'clean', label: 'Clean Sans' },
    { id: 'script', label: 'Modern Script' },
    { id: 'classic-script', label: 'Classic Script' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Poster Headings & Footer */}
      <section className="space-y-3" aria-label="Poster Headings and Footer">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Tournament Headings &amp; Footer</h2>
          <button
            type="button"
            onClick={() => onChangeHeader({ ...DEFAULT_HEADER })}
            className="text-xs font-medium text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            Reset Headings
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="header-date" className="block text-xs font-semibold text-slate-700 mb-1">
              Date Line
            </label>
            <input
              id="header-date"
              type="text"
              value={header.dateText}
              onChange={(e) => onChangeHeader({ dateText: e.target.value })}
              placeholder="13 NOV 2026"
              className="w-full px-3 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label htmlFor="header-color" className="block text-xs font-semibold text-slate-700 mb-1">
              Heading &amp; Footer Color
            </label>
            <div className="flex items-center gap-2">
              <input
                id="header-color"
                type="color"
                value={design.titleColor}
                onChange={(e) => onChangeDesign({ titleColor: e.target.value })}
                className="w-9 h-9 p-0.5 bg-white border border-slate-300 rounded cursor-pointer shrink-0"
              />
              <button
                type="button"
                onClick={() => onChangeDesign({ titleColor: '#0D0E12' })}
                className="px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded bg-white hover:bg-slate-50 cursor-pointer"
              >
                Dark
              </button>
              <button
                type="button"
                onClick={() => onChangeDesign({ titleColor: '#FFFFFF' })}
                className="px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded bg-white hover:bg-slate-50 cursor-pointer"
              >
                White
              </button>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="header-tournament-name" className="block text-xs font-semibold text-slate-700 mb-1">
            Tournament Name
          </label>
          <input
            id="header-tournament-name"
            type="text"
            value={header.tournamentName}
            onChange={(e) => onChangeHeader({ tournamentName: e.target.value })}
            placeholder="YOUR TOURNAMENT NAME"
            className="w-full px-3 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-slate-900"
          />
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="header-subheading" className="text-xs font-semibold text-slate-700">
              Sub Heading
            </label>
            <div className="inline-flex p-0.5 bg-slate-100 border border-slate-200 rounded-md">
              {subHeadingStyles.map((styleOpt) => (
                <button
                  key={styleOpt.id}
                  type="button"
                  onClick={() => onChangeDesign({ subHeadingFont: styleOpt.id })}
                  aria-pressed={(design.subHeadingFont || 'clean') === styleOpt.id}
                  className={`px-2 py-1 text-[11px] font-semibold rounded transition-colors whitespace-nowrap cursor-pointer ${
                    (design.subHeadingFont || 'clean') === styleOpt.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {styleOpt.label}
                </button>
              ))}
            </div>
          </div>
          <input
            id="header-subheading"
            type="text"
            value={header.subHeading}
            onChange={(e) => onChangeHeader({ subHeading: e.target.value })}
            placeholder="e.g. GRAND FINALS · DAY 1"
            className="w-full px-3 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-slate-900"
          />
        </div>

        <div>
          <label htmlFor="header-footer-text" className="block text-xs font-semibold text-slate-700 mb-1">
            Point Table Footer Text (Optional)
          </label>
          <input
            id="header-footer-text"
            type="text"
            value={header.footerText ?? ''}
            onChange={(e) => onChangeHeader({ footerText: e.target.value })}
            placeholder="e.g. ORGANIZED BY FF ESPORTS · LIVE ON YOUTUBE"
            className="w-full px-3 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-slate-900"
          />
        </div>
      </section>

      <hr className="border-slate-200" />

      {/* 2. Background & Gradient */}
      <section className="space-y-3" aria-label="Background and Gradient">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-900">Background &amp; Team Gradient</h2>
          <div className="inline-flex p-0.5 bg-slate-100 border border-slate-200 rounded-lg max-w-full">
            {(
              [
                { id: 'preset', label: 'Presets' },
                { id: 'custom-gradient', label: 'Custom Gradient' },
                { id: 'custom-image', label: 'Custom Image' },
              ] as const
            ).map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => handleBgModeChange(mode.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  design.bgMode === mode.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {design.bgMode === 'preset' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {THEME_PRESETS.map((preset) => {
              const active = design.themeId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.id)}
                  aria-pressed={active}
                  className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    active
                      ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900/15'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span
                    className="w-7 h-7 rounded-md shrink-0 border border-black/10"
                    style={{
                      background: `linear-gradient(${preset.bgAngle}deg, ${preset.bgStart}, ${preset.bgMid}, ${preset.bgEnd})`,
                    }}
                    aria-hidden="true"
                  />
                  <span className="text-xs font-semibold text-slate-800 truncate">
                    {preset.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {design.bgMode === 'premium-image' && (
          <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            Premium Studio Image active — choose any backdrop below or switch back to Presets / Custom Gradient above.
          </p>
        )}

        {design.bgMode === 'custom-gradient' && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="grad-start" className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Start Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="grad-start"
                    type="color"
                    value={design.customGradientStart}
                    onChange={(e) => handleCustomGradientColor('customGradientStart', e.target.value)}
                    className="w-8 h-8 p-0.5 bg-white border border-slate-300 rounded cursor-pointer"
                  />
                  <span className="text-[11px] font-mono-num text-slate-600">
                    {design.customGradientStart}
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="grad-mid" className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Middle Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="grad-mid"
                    type="color"
                    value={design.customGradientMid}
                    onChange={(e) => handleCustomGradientColor('customGradientMid', e.target.value)}
                    className="w-8 h-8 p-0.5 bg-white border border-slate-300 rounded cursor-pointer"
                  />
                  <span className="text-[11px] font-mono-num text-slate-600">
                    {design.customGradientMid}
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="grad-end" className="block text-[11px] font-semibold text-slate-600 mb-1">
                  End Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="grad-end"
                    type="color"
                    value={design.customGradientEnd}
                    onChange={(e) => handleCustomGradientColor('customGradientEnd', e.target.value)}
                    className="w-8 h-8 p-0.5 bg-white border border-slate-300 rounded cursor-pointer"
                  />
                  <span className="text-[11px] font-mono-num text-slate-600">
                    {design.customGradientEnd}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <label htmlFor="grad-angle" className="font-semibold text-slate-700">
                  Gradient Angle
                </label>
                <span className="font-mono-num text-slate-600">{design.customGradientAngle}°</span>
              </div>
              <input
                id="grad-angle"
                type="range"
                min={0}
                max={360}
                value={design.customGradientAngle}
                onChange={(e) =>
                  onChangeDesign({ customGradientAngle: Number(e.target.value) })
                }
                className="w-full accent-slate-900"
              />
            </div>
          </div>
        )}

        {design.bgMode === 'custom-image' && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="custom-bg-upload"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {design.customBgDataUrl ? (
                  <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <ImagePlus className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>
                  {uploadingImage
                    ? 'Processing...'
                    : design.customBgDataUrl
                      ? 'Replace Background Image'
                      : 'Upload Custom Background'}
                </span>
              </button>

              {design.customBgDataUrl && (
                <button
                  type="button"
                  onClick={() =>
                    onChangeDesign({
                      customBgDataUrl: null,
                      bgMode: 'preset',
                    })
                  }
                  className="px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-md hover:text-red-600 hover:border-red-200 cursor-pointer"
                >
                  Remove Image
                </button>
              )}
            </div>

            {!design.customBgDataUrl && (
              <p className="text-xs text-slate-500">
                Upload any PNG or JPG poster backdrop. Top-4 team row gradients will automatically adapt to match your uploaded image palette.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <label htmlFor="bg-dim" className="font-semibold text-slate-700">
                    Overlay Tint Dim
                  </label>
                  <span className="font-mono-num text-slate-600">
                    {Math.round(design.bgOverlayOpacity * 100)}%
                  </span>
                </div>
                <input
                  id="bg-dim"
                  type="range"
                  min={0}
                  max={0.75}
                  step={0.05}
                  value={design.bgOverlayOpacity}
                  onChange={(e) =>
                    onChangeDesign({ bgOverlayOpacity: Number(e.target.value) })
                  }
                  className="w-full accent-slate-900"
                />
              </div>

              <div>
                <label htmlFor="bg-overlay-color" className="block text-xs font-semibold text-slate-700 mb-1">
                  Overlay Color
                </label>
                <input
                  id="bg-overlay-color"
                  type="color"
                  value={design.bgOverlayColor}
                  onChange={(e) => onChangeDesign({ bgOverlayColor: e.target.value })}
                  className="w-9 h-8 p-0.5 bg-white border border-slate-300 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Top-4 Team Row Gradient Sync & Halftone */}
        <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={design.autoSyncRowGradient}
                onChange={(e) => onChangeDesign({ autoSyncRowGradient: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-slate-900"
              />
              <span>Auto-match Team Row gradient with Background</span>
            </label>

            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={design.halftoneEnabled}
                onChange={(e) => onChangeDesign({ halftoneEnabled: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-slate-900"
              />
              <span>Halftone Dots</span>
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="row-grad-start" className="block text-[11px] font-semibold text-slate-600 mb-1">
                Team Row Left Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="row-grad-start"
                  type="color"
                  value={design.rowGradientStart}
                  onChange={(e) =>
                    onChangeDesign({
                      autoSyncRowGradient: false,
                      rowGradientStart: e.target.value,
                    })
                  }
                  className="w-8 h-8 p-0.5 bg-white border border-slate-300 rounded cursor-pointer"
                />
                <span className="text-[11px] font-mono-num text-slate-500">
                  {design.rowGradientStart}
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="row-grad-end" className="block text-[11px] font-semibold text-slate-600 mb-1">
                Team Row Right Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="row-grad-end"
                  type="color"
                  value={design.rowGradientEnd}
                  onChange={(e) =>
                    onChangeDesign({
                      autoSyncRowGradient: false,
                      rowGradientEnd: e.target.value,
                    })
                  }
                  className="w-8 h-8 p-0.5 bg-white border border-slate-300 rounded cursor-pointer"
                />
                <span className="text-[11px] font-mono-num text-slate-500">
                  {design.rowGradientEnd}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                <label htmlFor="row-opacity">Row Opacity</label>
                <span className="font-mono-num">{Math.round(design.rowGradientOpacity * 100)}%</span>
              </div>
              <input
                id="row-opacity"
                type="range"
                min={0.55}
                max={1}
                step={0.02}
                value={design.rowGradientOpacity}
                onChange={(e) =>
                  onChangeDesign({ rowGradientOpacity: Number(e.target.value) })
                }
                className="w-full accent-slate-900 mt-1.5"
              />
            </div>
          </div>
        </div>

        {/* Premium Image Backgrounds Gallery directly under Background & Team Gradient */}
        <div className="pt-2 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Premium Image Backgrounds</h3>
              <p className="text-[11px] text-slate-500">
                Studio-crafted 2160px backdrops with auto-matched team row gradients
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {PREMIUM_BACKGROUNDS.map((item) => {
              const active =
                design.bgMode === 'premium-image' && design.premiumBgId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectPremiumBg(item)}
                  aria-pressed={active}
                  className={`flex items-center gap-3 p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    active
                      ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900/15'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <img
                    src={item.imageUrl}
                    alt={`${item.name} background preview`}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-md object-cover shrink-0 border border-black/10"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{item.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <hr className="border-slate-200" />

      {/* 3. Crown & Cup Award Colors */}
      <section className="space-y-3" aria-label="Award Icon Colors">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Crown &amp; Cup Colors</h2>
          <button
            type="button"
            onClick={() => {
              const def = createDefaultDesignConfig();
              onChangeDesign({ crownColor: def.crownColor, cupColor: def.cupColor });
            }}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" aria-hidden="true" />
            <span>Reset (Black Crown / Red Cup)</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CrownVectorIcon color={design.crownColor} size={18} />
              <label htmlFor="crown-color-picker" className="text-xs font-semibold text-slate-700">
                Crown Color
              </label>
            </div>
            <input
              id="crown-color-picker"
              type="color"
              value={design.crownColor}
              onChange={(e) => onChangeDesign({ crownColor: e.target.value })}
              className="w-8 h-8 p-0.5 bg-white border border-slate-300 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CupVectorIcon color={design.cupColor} size={18} />
              <label htmlFor="cup-color-picker" className="text-xs font-semibold text-slate-700">
                Cup Color
              </label>
            </div>
            <input
              id="cup-color-picker"
              type="color"
              value={design.cupColor}
              onChange={(e) => onChangeDesign({ cupColor: e.target.value })}
              className="w-8 h-8 p-0.5 bg-white border border-slate-300 rounded cursor-pointer"
            />
          </div>
        </div>
      </section>

      <hr className="border-slate-200" />

      {/* 4. Save Custom Design in App */}
      <section className="space-y-3" aria-label="Saved Custom Designs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Saved Custom Designs</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Save your current background, row gradient, and headings inside the app to reuse in future tournaments.
          </p>
        </div>

        <form onSubmit={handleSaveSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={designName}
            onChange={(e) => {
              setDesignName(e.target.value);
              if (saveMessage) setSaveMessage(null);
            }}
            placeholder="e.g. Grand Finals Pink-Gold"
            aria-label="Custom Design Name"
            className="flex-1 px-3 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-slate-900"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <BookmarkPlus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Save Design</span>
          </button>
        </form>

        {saveMessage && (
          <p
            role={saveMessage.type === 'err' ? 'alert' : 'status'}
            className={`text-xs font-medium ${
              saveMessage.type === 'err' ? 'text-red-600' : 'text-emerald-700'
            }`}
          >
            {saveMessage.text}
          </p>
        )}

        {savedDesigns.length === 0 ? (
          <div className="p-4 text-center border border-dashed border-slate-300 rounded-lg bg-slate-50/70">
            <p className="text-xs text-slate-500">
              No custom designs saved yet. Customize your gradient or upload a background above and save it here.
            </p>
          </div>
        ) : (
          <ul className="space-y-2" aria-label="Saved designs list">
            {savedDesigns.map((saved) => {
              const premItem =
                saved.config.bgMode === 'premium-image'
                  ? PREMIUM_BACKGROUNDS.find((p) => p.id === saved.config.premiumBgId)
                  : null;

              const bgStyle =
                saved.config.bgMode === 'custom-image' && saved.config.customBgDataUrl
                  ? {
                      backgroundImage: `url(${saved.config.customBgDataUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }
                  : premItem
                    ? {
                        backgroundImage: `url(${premItem.imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }
                    : {
                        background: `linear-gradient(${saved.config.customGradientAngle}deg, ${saved.config.customGradientStart}, ${saved.config.customGradientMid}, ${saved.config.customGradientEnd})`,
                      };

              return (
                <li
                  key={saved.id}
                  className="flex items-center justify-between gap-3 p-2.5 bg-white border border-slate-200 rounded-lg"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-9 h-9 rounded-md border border-black/10 shrink-0"
                      style={bgStyle}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{saved.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {saved.config.bgMode === 'custom-image'
                          ? 'Custom Image'
                          : saved.config.bgMode === 'premium-image'
                            ? 'Premium Image'
                            : saved.config.bgMode === 'custom-gradient'
                              ? 'Custom Gradient'
                              : 'Theme Preset'}{' '}
                        · {new Date(saved.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onApplySavedDesign(saved)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteSavedDesign(saved.id)}
                      aria-label={`Delete saved design ${saved.name}`}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};
