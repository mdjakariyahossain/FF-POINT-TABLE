import { PosterDesignConfig, PosterHeader, TeamRow } from '../types/pointTable';
import {
  deriveSyncedRowGradient,
  getContrastTextColor,
  getPresetById,
  hexToRgba,
} from './colorThemes';
import { getPremiumBackgroundById } from './premiumBackgrounds';

const LOGICAL_SIZE = 1080;

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radii: number | [number, number, number, number]
) {
  const [tl, tr, br, bl] = typeof radii === 'number' ? [radii, radii, radii, radii] : radii;
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
  ctx.lineTo(x + w, y + h - br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
  ctx.lineTo(x + bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
  ctx.lineTo(x, y + tl);
  ctx.quadraticCurveTo(x, y, x + tl, y);
  ctx.closePath();
}

function createAngledGradient(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  angleDeg: number,
  startColor: string,
  midColor: string,
  endColor: string
): CanvasGradient {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  const cx = w / 2;
  const cy = h / 2;
  const len = Math.abs(w * Math.cos(rad)) + Math.abs(h * Math.sin(rad));
  const dx = (Math.cos(rad) * len) / 2;
  const dy = (Math.sin(rad) * len) / 2;

  const grad = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
  grad.addColorStop(0, startColor);
  grad.addColorStop(0.48, midColor);
  grad.addColorStop(1, endColor);
  return grad;
}

function drawCrownIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  fillColor: string,
  needsLightHalo: boolean
) {
  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2);
  const s = size / 24;

  ctx.beginPath();
  // Crisp geometric esports crown path
  ctx.moveTo(2.5 * s, 18.5 * s);
  ctx.lineTo(2.0 * s, 7.5 * s);
  ctx.lineTo(7.5 * s, 12.2 * s);
  ctx.lineTo(12.0 * s, 4.5 * s);
  ctx.lineTo(16.5 * s, 12.2 * s);
  ctx.lineTo(22.0 * s, 7.5 * s);
  ctx.lineTo(21.5 * s, 18.5 * s);
  ctx.closePath();

  if (needsLightHalo) {
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 2.2 * s;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  ctx.fillStyle = fillColor;
  ctx.fill();

  // Base band under crown
  drawRoundedRectPath(ctx, 2.5 * s, 19.6 * s, 19 * s, 2.3 * s, 1 * s);
  ctx.fillStyle = fillColor;
  ctx.fill();

  // Crown jewel tips
  const tips: [number, number][] = [
    [2.2 * s, 6.2 * s],
    [12.0 * s, 3.4 * s],
    [21.8 * s, 6.2 * s],
  ];
  for (const [tx, ty] of tips) {
    ctx.beginPath();
    ctx.arc(tx, ty, 1.35 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawTrophyCupIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  fillColor: string
) {
  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2);
  const s = size / 24;

  // Handles
  ctx.strokeStyle = fillColor;
  ctx.lineWidth = 2.0 * s;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Left handle
  ctx.beginPath();
  ctx.moveTo(6.5 * s, 5.2 * s);
  ctx.bezierCurveTo(2.4 * s, 5.2 * s, 2.4 * s, 11.2 * s, 6.8 * s, 11.5 * s);
  ctx.stroke();

  // Right handle
  ctx.beginPath();
  ctx.moveTo(17.5 * s, 5.2 * s);
  ctx.bezierCurveTo(21.6 * s, 5.2 * s, 21.6 * s, 11.2 * s, 17.2 * s, 11.5 * s);
  ctx.stroke();

  // Cup bowl
  ctx.beginPath();
  ctx.moveTo(6.2 * s, 3.5 * s);
  ctx.lineTo(17.8 * s, 3.5 * s);
  ctx.lineTo(17.2 * s, 10.6 * s);
  ctx.bezierCurveTo(16.9 * s, 14.3 * s, 14.5 * s, 16.0 * s, 12.0 * s, 16.2 * s);
  ctx.bezierCurveTo(9.5 * s, 16.0 * s, 7.1 * s, 14.3 * s, 6.8 * s, 10.6 * s);
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();

  // Stem
  ctx.fillRect(10.6 * s, 15.6 * s, 2.8 * s, 3.6 * s);

  // Base pedestal
  drawRoundedRectPath(ctx, 7.2 * s, 19.0 * s, 9.6 * s, 2.6 * s, 1.0 * s);
  ctx.fill();

  ctx.restore();
}

function fitTextWithEllipsis(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let trimmed = text;
  while (trimmed.length > 1 && ctx.measureText(`${trimmed}…`).width > maxWidth) {
    trimmed = trimmed.slice(0, -1);
  }
  return `${trimmed}…`;
}

export interface RenderPosterParams {
  canvas: HTMLCanvasElement;
  header: PosterHeader;
  teams: TeamRow[];
  design: PosterDesignConfig;
  bgImage: HTMLImageElement | null;
  pixelScale?: number;
}

export function renderPointTablePoster({
  canvas,
  header,
  teams,
  design,
  bgImage,
  pixelScale = 2,
}: RenderPosterParams): void {
  const targetPx = LOGICAL_SIZE * pixelScale;
  if (canvas.width !== targetPx || canvas.height !== targetPx) {
    canvas.width = targetPx;
    canvas.height = targetPx;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.save();
  ctx.scale(pixelScale, pixelScale);

  const preset = getPresetById(design.themeId);

  // 1. Background Layer
  const isImageBg = design.bgMode === 'custom-image' || design.bgMode === 'premium-image';
  if (isImageBg && bgImage && bgImage.complete && bgImage.naturalWidth > 0) {
    // Cover crop
    const imgRatio = bgImage.naturalWidth / bgImage.naturalHeight;
    let drawW = LOGICAL_SIZE;
    let drawH = LOGICAL_SIZE;
    let offsetX = 0;
    let offsetY = 0;
    if (imgRatio > 1) {
      drawW = LOGICAL_SIZE * imgRatio;
      offsetX = -(drawW - LOGICAL_SIZE) / 2;
    } else {
      drawH = LOGICAL_SIZE / imgRatio;
      offsetY = -(drawH - LOGICAL_SIZE) / 2;
    }
    ctx.drawImage(bgImage, offsetX, offsetY, drawW, drawH);

    if (design.bgOverlayOpacity > 0) {
      ctx.fillStyle = hexToRgba(design.bgOverlayColor, design.bgOverlayOpacity);
      ctx.fillRect(0, 0, LOGICAL_SIZE, LOGICAL_SIZE);
    }

    // Subtle premium inner border frame for image backdrops
    if (design.bgMode === 'premium-image') {
      ctx.save();
      drawRoundedRectPath(ctx, 26, 26, LOGICAL_SIZE - 52, LOGICAL_SIZE - 52, 16);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.24)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }
  } else {
    const start = design.bgMode === 'custom-gradient' ? design.customGradientStart : preset.bgStart;
    const mid = design.bgMode === 'custom-gradient' ? design.customGradientMid : preset.bgMid;
    const end = design.bgMode === 'custom-gradient' ? design.customGradientEnd : preset.bgEnd;
    const angle = design.bgMode === 'custom-gradient' ? design.customGradientAngle : preset.bgAngle;

    ctx.fillStyle = createAngledGradient(ctx, LOGICAL_SIZE, LOGICAL_SIZE, angle, start, mid, end);
    ctx.fillRect(0, 0, LOGICAL_SIZE, LOGICAL_SIZE);
  }

  // 2. Subtle Halftone Dot Matrix Pattern
  if (design.halftoneEnabled && design.halftoneOpacity > 0) {
    const dotStep = 14;
    const dotColor = hexToRgba(preset.halftoneColor, design.halftoneOpacity);
    ctx.fillStyle = dotColor;
    for (let y = 7; y < LOGICAL_SIZE; y += dotStep) {
      for (let x = 7; x < LOGICAL_SIZE; x += dotStep) {
        // Subtle vignette density like reference image
        const nx = (x - LOGICAL_SIZE / 2) / (LOGICAL_SIZE / 2);
        const ny = (y - LOGICAL_SIZE / 2) / (LOGICAL_SIZE / 2);
        const dist = Math.min(1, Math.sqrt(nx * nx + ny * ny));
        const r = 1.05 + dist * 0.75;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Resolve active row gradient colors synced to background
  let topRowStart = design.rowGradientStart;
  let topRowEnd = design.rowGradientEnd;
  let headerTeamStart = preset.headerTeamStart;
  let headerTeamEnd = preset.headerTeamEnd;

  if (design.autoSyncRowGradient) {
    if (design.bgMode === 'preset') {
      topRowStart = preset.topRowStart;
      topRowEnd = preset.topRowEnd;
      headerTeamStart = preset.headerTeamStart;
      headerTeamEnd = preset.headerTeamEnd;
    } else if (design.bgMode === 'custom-gradient') {
      const synced = deriveSyncedRowGradient(design.customGradientStart, design.customGradientEnd);
      topRowStart = synced.rowStart;
      topRowEnd = synced.rowEnd;
      headerTeamStart = synced.headerTeamStart;
      headerTeamEnd = synced.headerTeamEnd;
    } else if (design.bgMode === 'premium-image') {
      const prem = getPremiumBackgroundById(design.premiumBgId);
      topRowStart = prem ? prem.rowStart : design.rowGradientStart;
      topRowEnd = prem ? prem.rowEnd : design.rowGradientEnd;
      const synced = deriveSyncedRowGradient(topRowStart, topRowEnd);
      headerTeamStart = synced.headerTeamStart;
      headerTeamEnd = synced.headerTeamEnd;
    } else {
      const synced = deriveSyncedRowGradient(design.rowGradientStart, design.rowGradientEnd);
      topRowStart = design.rowGradientStart;
      topRowEnd = design.rowGradientEnd;
      headerTeamStart = synced.headerTeamStart;
      headerTeamEnd = synced.headerTeamEnd;
    }
  } else {
    const synced = deriveSyncedRowGradient(design.rowGradientStart, design.rowGradientEnd);
    topRowStart = design.rowGradientStart;
    topRowEnd = design.rowGradientEnd;
    headerTeamStart = synced.headerTeamStart;
    headerTeamEnd = synced.headerTeamEnd;
  }

  const titleColor = design.titleColor || preset.titleColor;
  const topRowTextColor = getContrastTextColor(topRowStart, topRowEnd);
  const crownNeedsHalo = topRowTextColor === '#FFFFFF';

  const ctxExt = ctx as CanvasRenderingContext2D & {
    letterSpacing?: string;
    wordSpacing?: string;
  };

  // 3. Poster Top Header Block
  const centerX = LOGICAL_SIZE / 2;

  // Date text with flanking lines (e.g. —— 13 NOV 2026 ——)
  const dateDisplay = (header.dateText || '13 NOV 2026').toUpperCase();
  ctx.font = '700 22px "Anton", "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = titleColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const dateW = ctx.measureText(dateDisplay).width;
  ctx.fillText(dateDisplay, centerX, 58);

  ctx.strokeStyle = titleColor;
  ctx.lineWidth = 2.5;
  const lineGap = 18;
  const lineLen = 56;
  // Left line
  ctx.beginPath();
  ctx.moveTo(centerX - dateW / 2 - lineGap - lineLen, 58);
  ctx.lineTo(centerX - dateW / 2 - lineGap, 58);
  ctx.stroke();
  // Right line
  ctx.beginPath();
  ctx.moveTo(centerX + dateW / 2 + lineGap, 58);
  ctx.lineTo(centerX + dateW / 2 + lineGap + lineLen, 58);
  ctx.stroke();

  // Main Tournament Title
  const mainTitle = (header.tournamentName || 'YOUR TOURNAMENT NAME').toUpperCase();
  let titleFontSize = 72;
  ctx.font = `400 ${titleFontSize}px "Anton", Impact, sans-serif`;
  while (titleFontSize > 38 && ctx.measureText(mainTitle).width > 930) {
    titleFontSize -= 2;
    ctx.font = `400 ${titleFontSize}px "Anton", Impact, sans-serif`;
  }
  ctx.fillStyle = titleColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(mainTitle, centerX, 122);

  // Sub Heading (Crisp, well-spaced and never overlapping title or table)
  const subText = (header.subHeading ?? '').trim();
  if (subText) {
    const subStyle = design.subHeadingFont || 'clean';
    ctx.save();
    if (subStyle === 'classic-script') {
      let subFontSize = 82;
      if ('letterSpacing' in ctxExt) ctxExt.letterSpacing = '0.5px';
      if ('wordSpacing' in ctxExt) ctxExt.wordSpacing = '6px';
      ctx.font = `400 ${subFontSize}px "Great Vibes", cursive`;
      while (subFontSize > 40 && ctx.measureText(subText).width > 860) {
        subFontSize -= 2;
        ctx.font = `400 ${subFontSize}px "Great Vibes", cursive`;
      }
    } else if (subStyle === 'script') {
      let subFontSize = 64;
      if ('letterSpacing' in ctxExt) ctxExt.letterSpacing = '0.5px';
      if ('wordSpacing' in ctxExt) ctxExt.wordSpacing = '5px';
      ctx.font = `700 ${subFontSize}px "Dancing Script", cursive`;
      while (subFontSize > 32 && ctx.measureText(subText).width > 860) {
        subFontSize -= 2;
        ctx.font = `700 ${subFontSize}px "Dancing Script", cursive`;
      }
    } else {
      let subFontSize = 42;
      if ('letterSpacing' in ctxExt) ctxExt.letterSpacing = '2.5px';
      if ('wordSpacing' in ctxExt) ctxExt.wordSpacing = '4px';
      ctx.font = `700 ${subFontSize}px "Plus Jakarta Sans", sans-serif`;
      while (subFontSize > 22 && ctx.measureText(subText).width > 860) {
        subFontSize -= 2;
        ctx.font = `700 ${subFontSize}px "Plus Jakarta Sans", sans-serif`;
      }
    }
    ctx.fillStyle = titleColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(subText, centerX, 218);
    ctx.restore();
  }

  // 4. Dynamic Point Table Layout Geometry
  const rowCount = Math.max(1, teams.length);
  const footerDisplay = (header.footerText ?? '').trim();
  const hasFooter = footerDisplay.length > 0;

  const availableTop = subText ? 298 : 228;
  const availableBottom = hasFooter ? 1006 : 1042;
  const headerH = rowCount > 14 ? 56 : 62;
  const headerToRowsGap = 6;

  let rowGap = 5;
  let rowH = 44;
  if (rowCount <= 8) {
    rowGap = 7;
    rowH = 48;
  } else if (rowCount <= 11) {
    rowGap = 6;
    rowH = 46;
  } else if (rowCount === 12) {
    rowGap = 5;
    rowH = 44;
  } else {
    rowGap = rowCount >= 16 ? 3 : 4;
    const maxRowsSpace = availableBottom - availableTop - headerH - headerToRowsGap;
    rowH = Math.max(24, Math.min(42, Math.floor((maxRowsSpace - (rowCount - 1) * rowGap) / rowCount)));
  }

  const totalTableH = headerH + headerToRowsGap + rowCount * rowH + (rowCount - 1) * rowGap;
  const extraSpace = Math.max(0, availableBottom - availableTop - totalTableH);
  const headerY = Math.round(availableTop + Math.min(130, extraSpace * 0.4));

  const tableX = 78;
  const tableW = 924;
  const colRankW = 88;
  const colTeamW = 332;
  const colWinW = 112;
  const colPlaceW = 134;
  const colFinishW = 134;
  const colTotalW = 124;

  const colRankX = tableX;
  const colTeamX = colRankX + colRankW;
  const colWinX = colTeamX + colTeamW;
  const colPlaceX = colWinX + colWinW;
  const colFinishX = colPlaceX + colPlaceW;
  const colTotalX = colFinishX + colFinishW;

  const headerRadius = 10;

  // Subtle shadow under table header bar for premium depth
  ctx.save();
  drawRoundedRectPath(ctx, tableX, headerY, tableW, headerH, headerRadius);
  ctx.shadowColor = 'rgba(10, 12, 24, 0.16)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.01)';
  ctx.fill();
  ctx.restore();

  // Header Left: RANK (white)
  drawRoundedRectPath(ctx, colRankX, headerY, colRankW, headerH, [headerRadius, 0, 0, headerRadius]);
  ctx.fillStyle = preset.headerRankBg;
  ctx.fill();

  // Header Left-Mid: TEAM NAME (pink/synced gradient)
  ctx.beginPath();
  ctx.rect(colTeamX, headerY, colTeamW, headerH);
  const headerTeamGrad = ctx.createLinearGradient(colTeamX, headerY, colWinX, headerY);
  headerTeamGrad.addColorStop(0, headerTeamStart);
  headerTeamGrad.addColorStop(1, headerTeamEnd);
  ctx.fillStyle = headerTeamGrad;
  ctx.fill();

  // Header Right: WIN / PLACEMENT / FINISH / TOTAL (dark charcoal)
  const statsW = colWinW + colPlaceW + colFinishW + colTotalW;
  drawRoundedRectPath(ctx, colWinX, headerY, statsW, headerH, [0, headerRadius, headerRadius, 0]);
  ctx.fillStyle = preset.headerStatsBg;
  ctx.fill();

  // Header Labels
  if ('wordSpacing' in ctxExt) ctxExt.wordSpacing = '2px';
  if ('letterSpacing' in ctxExt) ctxExt.letterSpacing = '0.3px';

  ctx.fillStyle = preset.headerRankText;
  ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('RANK', colRankX + colRankW / 2, headerY + headerH / 2 + 1);

  ctx.fillStyle = getContrastTextColor(headerTeamStart, headerTeamEnd);
  ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('TEAM NAME', colTeamX + 18, headerY + headerH / 2 + 1);

  ctx.fillStyle = preset.headerStatsText;
  ctx.font = '700 14.5px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('WIN', colWinX + colWinW / 2, headerY + headerH / 2 + 1);

  ctx.font = '700 13.5px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('PLACEMENT', colPlaceX + colPlaceW / 2, headerY + headerH / 2 - 8);
  ctx.fillText('POINT', colPlaceX + colPlaceW / 2, headerY + headerH / 2 + 10);

  ctx.fillText('FINISH POINT', colFinishX + colFinishW / 2, headerY + headerH / 2 + 1);
  ctx.fillText('TOTAL POINT', colTotalX + colTotalW / 2, headerY + headerH / 2 + 1);

  if ('wordSpacing' in ctxExt) ctxExt.wordSpacing = '2.5px';
  if ('letterSpacing' in ctxExt) ctxExt.letterSpacing = '0.25px';

  // 5. Render Exact Number of Team Rows
  const startRowsY = headerY + headerH + headerToRowsGap;
  const rowRadius = rowH < 36 ? 5 : 7;
  const rowScale = Math.min(1, rowH / 44);
  const nameFontPx = Math.max(13, Math.round(20 * rowScale));
  const statFontPx = Math.max(13, Math.round(21 * rowScale));
  const rankFontPx = Math.max(13, Math.round(19.5 * rowScale));
  const iconSize = Math.max(14, Math.round(21 * rowScale));
  const iconGap = Math.max(4, Math.round(6 * rowScale));
  const afterNameGap = Math.max(7, Math.round(10 * rowScale));

  for (let i = 0; i < teams.length; i++) {
    const team = teams[i];
    const y = startRowsY + i * (rowH + rowGap);
    const isTop4 = i < 4;
    const rankStr = String(i + 1).padStart(2, '0');

    if (isTop4) {
      // Rank Box (Black box on left, separated by 4px gap)
      const rankBoxW = colRankW - 4;
      ctx.save();
      drawRoundedRectPath(ctx, colRankX, y, rankBoxW, rowH, rowRadius);
      ctx.shadowColor = 'rgba(10, 12, 24, 0.14)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 3;
      ctx.fillStyle = preset.topRankBg;
      ctx.fill();
      ctx.restore();

      // Main Top-4 Row Bar (Background-synced gradient)
      const barX = colTeamX;
      const barW = tableW - colRankW;
      ctx.save();
      drawRoundedRectPath(ctx, barX, y, barW, rowH, rowRadius);
      ctx.shadowColor = 'rgba(10, 12, 24, 0.12)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 3;
      const rowGrad = ctx.createLinearGradient(barX, y, barX + barW, y);
      rowGrad.addColorStop(0, hexToRgba(topRowStart, design.rowGradientOpacity));
      rowGrad.addColorStop(1, hexToRgba(topRowEnd, design.rowGradientOpacity));
      ctx.fillStyle = rowGrad;
      ctx.fill();
      ctx.restore();

      // Subtle crisp rim border for definition
      drawRoundedRectPath(ctx, barX, y, barW, rowH, rowRadius);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.48)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Rank Text
      ctx.fillStyle = preset.topRankText;
      ctx.font = `800 ${rankFontPx}px "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(rankStr, colRankX + rankBoxW / 2, y + rowH / 2 + 1);
    } else {
      // Ranks 05+: Solid White Bar with subtle elevation
      ctx.save();
      drawRoundedRectPath(ctx, tableX, y, tableW, rowH, rowRadius);
      ctx.shadowColor = 'rgba(10, 12, 24, 0.10)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;
      ctx.fillStyle = preset.regularRowBg;
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = preset.regularRowText;
      ctx.font = `800 ${rankFontPx}px "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(rankStr, colRankX + colRankW / 2, y + rowH / 2 + 1);
    }

    // Team Name + Crown/Cup Icons right next to the Team Name
    const rowTextColor = isTop4 ? topRowTextColor : preset.regularRowText;
    const rowCy = y + rowH / 2;

    const iconCount = (team.hasCrown ? 1 : 0) + (team.hasCup ? 1 : 0);
    const iconsWidth =
      iconCount > 0
        ? afterNameGap + iconCount * iconSize + (iconCount - 1) * iconGap
        : 0;

    const nameStartX = colTeamX + 18;
    const maxNameWidth = colTeamW - 28 - iconsWidth;

    ctx.fillStyle = rowTextColor;
    ctx.font = `800 ${nameFontPx}px "Plus Jakarta Sans", sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const displayName = fitTextWithEllipsis(
      ctx,
      (team.name || `TEAM ${i + 1}`).toUpperCase(),
      maxNameWidth
    );
    ctx.fillText(displayName, nameStartX, rowCy + 1);

    // Draw Black Crown and Red Cup immediately next to the team name
    if (iconCount > 0) {
      const nameWidth = ctx.measureText(displayName).width;
      let iconCursorX = nameStartX + nameWidth + afterNameGap;

      if (team.hasCrown) {
        drawCrownIcon(
          ctx,
          iconCursorX + iconSize / 2,
          rowCy,
          iconSize,
          design.crownColor || '#0B0C10',
          isTop4 && crownNeedsHalo
        );
        iconCursorX += iconSize + iconGap;
      }
      if (team.hasCup) {
        drawTrophyCupIcon(
          ctx,
          iconCursorX + iconSize / 2,
          rowCy,
          iconSize,
          design.cupColor || '#DC2626'
        );
      }
    }

    // Numeric Stats (Win, Placement, Finish, Total)
    ctx.fillStyle = rowTextColor;
    ctx.font = `800 ${statFontPx}px "Plus Jakarta Sans", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillText(String(team.win), colWinX + colWinW / 2, rowCy + 1);
    ctx.fillText(String(team.placement), colPlaceX + colPlaceW / 2, rowCy + 1);
    ctx.fillText(String(team.finish), colFinishX + colFinishW / 2, rowCy + 1);
    ctx.fillText(String(team.total), colTotalX + colTotalW / 2, rowCy + 1);
  }

  // 6. Optional Footer Text below Point Table
  if (hasFooter) {
    const tableBottom = startRowsY + teams.length * rowH + Math.max(0, teams.length - 1) * rowGap;
    const footerY = Math.min(1042, Math.max(tableBottom + 34, 1028));
    ctx.save();
    if ('letterSpacing' in ctxExt) ctxExt.letterSpacing = '1.2px';
    if ('wordSpacing' in ctxExt) ctxExt.wordSpacing = '2px';

    let footerFontPx = 18;
    ctx.font = `700 ${footerFontPx}px "Plus Jakarta Sans", sans-serif`;
    while (footerFontPx > 12 && ctx.measureText(footerDisplay).width > 900) {
      footerFontPx -= 1;
      ctx.font = `700 ${footerFontPx}px "Plus Jakarta Sans", sans-serif`;
    }

    if (isImageBg) {
      ctx.shadowColor =
        titleColor.toUpperCase() === '#FFFFFF'
          ? 'rgba(0, 0, 0, 0.55)'
          : 'rgba(255, 255, 255, 0.45)';
      ctx.shadowBlur = 6;
    }

    ctx.fillStyle = hexToRgba(titleColor, 0.92);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(footerDisplay, centerX, footerY);
    ctx.restore();
  }

  ctx.restore();
}

export function exportPosterPng(
  header: PosterHeader,
  teams: TeamRow[],
  design: PosterDesignConfig,
  bgImage: HTMLImageElement | null,
  resolutionScale: 1 | 2 = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const offscreen = document.createElement('canvas');
    renderPointTablePoster({
      canvas: offscreen,
      header,
      teams,
      design,
      bgImage,
      pixelScale: resolutionScale,
    });

    const slug = (header.tournamentName || 'ff-point-table')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40);
    const filename = `${slug || 'ff-point-table'}-${resolutionScale * 1080}px.png`;

    offscreen.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to generate PNG image.'));
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      resolve(filename);
    }, 'image/png');
  });
}
