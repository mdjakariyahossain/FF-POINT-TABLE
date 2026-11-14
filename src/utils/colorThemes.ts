import { PosterDesignConfig, PosterHeader, ThemePreset } from '../types/pointTable';

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'reference-classic',
    name: 'Classic Pink-Blue',
    bgAngle: 135,
    bgStart: '#F6A6FF',
    bgMid: '#9B94F5',
    bgEnd: '#1442D4',
    halftoneColor: '#0E1238',
    headerRankBg: '#FFFFFF',
    headerRankText: '#0D0E12',
    headerTeamStart: '#FCAEFF',
    headerTeamEnd: '#E79AFF',
    headerTeamText: '#0D0E12',
    headerStatsBg: '#16181E',
    headerStatsText: '#FFFFFF',
    topRankBg: '#090A0D',
    topRankText: '#FFFFFF',
    topRowStart: '#F6BDFF',
    topRowEnd: '#8B89E8',
    topRowText: '#0D0E12',
    regularRowBg: '#FFFFFF',
    regularRowText: '#0D0E12',
    titleColor: '#0D0E12',
  },
  {
    id: 'crimson-blaze',
    name: 'Crimson Blaze',
    bgAngle: 135,
    bgStart: '#FDA4AF',
    bgMid: '#E11D48',
    bgEnd: '#4C0519',
    halftoneColor: '#1E030B',
    headerRankBg: '#FFFFFF',
    headerRankText: '#0D0E12',
    headerTeamStart: '#FECDD3',
    headerTeamEnd: '#FDA4AF',
    headerTeamText: '#0D0E12',
    headerStatsBg: '#16181E',
    headerStatsText: '#FFFFFF',
    topRankBg: '#090A0D',
    topRankText: '#FFFFFF',
    topRowStart: '#FFE4E6',
    topRowEnd: '#FB7185',
    topRowText: '#0D0E12',
    regularRowBg: '#FFFFFF',
    regularRowText: '#0D0E12',
    titleColor: '#0D0E12',
  },
  {
    id: 'emerald-surge',
    name: 'Emerald Surge',
    bgAngle: 135,
    bgStart: '#A7F3D0',
    bgMid: '#10B981',
    bgEnd: '#064E3B',
    halftoneColor: '#022C22',
    headerRankBg: '#FFFFFF',
    headerRankText: '#0D0E12',
    headerTeamStart: '#D1FAE5',
    headerTeamEnd: '#6EE7B7',
    headerTeamText: '#0D0E12',
    headerStatsBg: '#16181E',
    headerStatsText: '#FFFFFF',
    topRankBg: '#090A0D',
    topRankText: '#FFFFFF',
    topRowStart: '#ECFDF5',
    topRowEnd: '#6EE7B7',
    topRowText: '#0D0E12',
    regularRowBg: '#FFFFFF',
    regularRowText: '#0D0E12',
    titleColor: '#0D0E12',
  },
  {
    id: 'solar-gold',
    name: 'Solar Amber',
    bgAngle: 135,
    bgStart: '#FDE68A',
    bgMid: '#F59E0B',
    bgEnd: '#9A3412',
    halftoneColor: '#451A03',
    headerRankBg: '#FFFFFF',
    headerRankText: '#0D0E12',
    headerTeamStart: '#FEF3C7',
    headerTeamEnd: '#FCD34D',
    headerTeamText: '#0D0E12',
    headerStatsBg: '#16181E',
    headerStatsText: '#FFFFFF',
    topRankBg: '#090A0D',
    topRankText: '#FFFFFF',
    topRowStart: '#FEF3C7',
    topRowEnd: '#FBBF24',
    topRowText: '#0D0E12',
    regularRowBg: '#FFFFFF',
    regularRowText: '#0D0E12',
    titleColor: '#0D0E12',
  },
  {
    id: 'arctic-cyan',
    name: 'Arctic Cyan',
    bgAngle: 135,
    bgStart: '#BAE6FD',
    bgMid: '#0EA5E9',
    bgEnd: '#1E3A8A',
    halftoneColor: '#082F49',
    headerRankBg: '#FFFFFF',
    headerRankText: '#0D0E12',
    headerTeamStart: '#E0F2FE',
    headerTeamEnd: '#7DD3FC',
    headerTeamText: '#0D0E12',
    headerStatsBg: '#16181E',
    headerStatsText: '#FFFFFF',
    topRankBg: '#090A0D',
    topRankText: '#FFFFFF',
    topRowStart: '#E0F2FE',
    topRowEnd: '#60A5FA',
    topRowText: '#0D0E12',
    regularRowBg: '#FFFFFF',
    regularRowText: '#0D0E12',
    titleColor: '#0D0E12',
  },
  {
    id: 'midnight-violet',
    name: 'Midnight Violet',
    bgAngle: 135,
    bgStart: '#DDD6FE',
    bgMid: '#7C3AED',
    bgEnd: '#1E1B4B',
    halftoneColor: '#0F0B2E',
    headerRankBg: '#FFFFFF',
    headerRankText: '#0D0E12',
    headerTeamStart: '#EDE9FE',
    headerTeamEnd: '#C4B5FD',
    headerTeamText: '#0D0E12',
    headerStatsBg: '#16181E',
    headerStatsText: '#FFFFFF',
    topRankBg: '#090A0D',
    topRankText: '#FFFFFF',
    topRowStart: '#EDE9FE',
    topRowEnd: '#A78BFA',
    topRowText: '#0D0E12',
    regularRowBg: '#FFFFFF',
    regularRowText: '#0D0E12',
    titleColor: '#0D0E12',
  },
];

export const DEFAULT_HEADER: PosterHeader = {
  dateText: '13 NOV 2026',
  tournamentName: 'YOUR TOURNAMENT NAME',
  subHeading: 'Sub Heading',
  footerText: '',
};

export function createDefaultDesignConfig(): PosterDesignConfig {
  const classic = THEME_PRESETS[0];
  return {
    themeId: classic.id,
    bgMode: 'preset',
    premiumBgId: null,
    customBgDataUrl: null,
    bgOverlayColor: '#000000',
    bgOverlayOpacity: 0,
    customGradientStart: classic.bgStart,
    customGradientMid: classic.bgMid,
    customGradientEnd: classic.bgEnd,
    customGradientAngle: classic.bgAngle,
    halftoneEnabled: true,
    halftoneOpacity: 0.08,
    autoSyncRowGradient: true,
    rowGradientStart: classic.topRowStart,
    rowGradientEnd: classic.topRowEnd,
    rowGradientOpacity: 0.94,
    titleColor: classic.titleColor,
    subHeadingFont: 'clean',
    crownColor: '#0B0C10',
    cupColor: '#DC2626',
  };
}

export function getPresetById(id: string): ThemePreset {
  return THEME_PRESETS.find((t) => t.id === id) ?? THEME_PRESETS[0];
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '').trim();
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean.padEnd(6, '0').slice(0, 6);
  const num = Number.parseInt(full, 16);
  if (Number.isNaN(num)) return { r: 246, g: 166, b: 255 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((x) => x.toString(16).padStart(2, '0').toUpperCase())
      .join('')
  );
}

export function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function mixHex(hexA: string, hexB: string, ratio: number): string {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const t = Math.max(0, Math.min(1, ratio));
  return rgbToHex(
    a.r + (b.r - a.r) * t,
    a.g + (b.g - a.g) * t,
    a.b + (b.b - a.b) * t
  );
}

export function getRelativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function getContrastTextColor(bgHexA: string, bgHexB?: string): string {
  const lumA = getRelativeLuminance(bgHexA);
  const lumB = bgHexB ? getRelativeLuminance(bgHexB) : lumA;
  const avgLum = (lumA + lumB) / 2;
  return avgLum < 0.26 ? '#FFFFFF' : '#0D0E12';
}

/**
 * Generates harmonious pastel-to-accent row gradient colors from background colors
 * so top-4 team name rows always harmonize with any custom background gradient or image.
 */
export function deriveSyncedRowGradient(bgStart: string, bgEnd: string): {
  rowStart: string;
  rowEnd: string;
  headerTeamStart: string;
  headerTeamEnd: string;
} {
  // Blend start slightly toward white for crisp dark text readability, and end toward mid-accent
  const rowStart = mixHex(bgStart, '#FFFFFF', 0.26);
  const rowEnd = mixHex(bgEnd, '#FFFFFF', 0.42);
  const headerTeamStart = mixHex(bgStart, '#FFFFFF', 0.14);
  const headerTeamEnd = mixHex(mixHex(bgStart, bgEnd, 0.3), '#FFFFFF', 0.22);
  return { rowStart, rowEnd, headerTeamStart, headerTeamEnd };
}

/**
 * Extracts left and right average colors from raw RGBA image pixel data (e.g., 16x16 sample).
 */
export function extractRowColorsFromImagePixels(
  pixels: Uint8ClampedArray,
  width: number,
  height: number
): { rowStart: string; rowEnd: string; titleColor: string } {
  let leftR = 0,
    leftG = 0,
    leftB = 0,
    leftCount = 0;
  let rightR = 0,
    rightG = 0,
    rightB = 0,
    rightCount = 0;
  let topLumSum = 0,
    topCount = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];

      if (x < width / 2) {
        leftR += r;
        leftG += g;
        leftB += b;
        leftCount++;
      } else {
        rightR += r;
        rightG += g;
        rightB += b;
        rightCount++;
      }

      if (y < height * 0.35) {
        const hex = rgbToHex(r, g, b);
        topLumSum += getRelativeLuminance(hex);
        topCount++;
      }
    }
  }

  const leftHex =
    leftCount > 0
      ? rgbToHex(leftR / leftCount, leftG / leftCount, leftB / leftCount)
      : '#F6A6FF';
  const rightHex =
    rightCount > 0
      ? rgbToHex(rightR / rightCount, rightG / rightCount, rightB / rightCount)
      : '#1442D4';

  const synced = deriveSyncedRowGradient(leftHex, rightHex);
  const avgTopLum = topCount > 0 ? topLumSum / topCount : 0.6;
  const titleColor = avgTopLum < 0.25 ? '#FFFFFF' : '#0D0E12';

  return {
    rowStart: synced.rowStart,
    rowEnd: synced.rowEnd,
    titleColor,
  };
}
