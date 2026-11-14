export interface TeamRow {
  id: string;
  rank: number;
  name: string;
  win: number;
  placement: number;
  finish: number;
  total: number;
  hasCrown: boolean;
  hasCup: boolean;
}

export interface PosterHeader {
  dateText: string;
  tournamentName: string;
  subHeading: string;
  footerText: string;
}

export type BackgroundMode = 'preset' | 'premium-image' | 'custom-gradient' | 'custom-image';
export type SubHeadingFontStyle = 'clean' | 'script' | 'classic-script';

export interface ThemePreset {
  id: string;
  name: string;
  bgAngle: number;
  bgStart: string;
  bgMid: string;
  bgEnd: string;
  halftoneColor: string;
  headerRankBg: string;
  headerRankText: string;
  headerTeamStart: string;
  headerTeamEnd: string;
  headerTeamText: string;
  headerStatsBg: string;
  headerStatsText: string;
  topRankBg: string;
  topRankText: string;
  topRowStart: string;
  topRowEnd: string;
  topRowText: string;
  regularRowBg: string;
  regularRowText: string;
  titleColor: string;
}

export interface PosterDesignConfig {
  themeId: string;
  bgMode: BackgroundMode;
  premiumBgId: string | null;
  customBgDataUrl: string | null;
  bgOverlayColor: string;
  bgOverlayOpacity: number;
  customGradientStart: string;
  customGradientMid: string;
  customGradientEnd: string;
  customGradientAngle: number;
  halftoneEnabled: boolean;
  halftoneOpacity: number;
  autoSyncRowGradient: boolean;
  rowGradientStart: string;
  rowGradientEnd: string;
  rowGradientOpacity: number;
  titleColor: string;
  subHeadingFont: SubHeadingFontStyle;
  crownColor: string;
  cupColor: string;
}

export interface SavedDesign {
  id: string;
  name: string;
  createdAt: number;
  config: PosterDesignConfig;
  header?: PosterHeader;
}

export interface ParseSheetOptions {
  autoSort?: boolean;
  autoCalculateTotal?: boolean;
}

export interface ParseSheetResult {
  teams: TeamRow[];
  parsedCount: number;
  warnings: string[];
  detectedFormat: string;
}
