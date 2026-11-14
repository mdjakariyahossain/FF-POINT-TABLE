import { ParseSheetOptions, ParseSheetResult, TeamRow } from '../types/pointTable';

export const TOTAL_TABLE_SLOTS = 12;
export const MAX_TABLE_SLOTS = 20;

export function createDefaultTeams(): TeamRow[] {
  return Array.from({ length: TOTAL_TABLE_SLOTS }, (_, index) => {
    const rank = index + 1;
    return {
      id: `team-${rank}`,
      rank,
      name: `TEAM ${rank}`,
      win: 0,
      placement: 0,
      finish: 0,
      total: 0,
      hasCrown: false,
      hasCup: false,
    };
  });
}

export const SAMPLE_GOOGLE_SHEET_TSV = [
  'RANK\tTEAM NAME\tWIN\tPLACEMENT POINT\tFINISH POINT\tTOTAL POINT',
  '1\tTEAM PHOENIX\t3\t36\t42\t78',
  '2\tSHADOW ELITE\t2\t30\t35\t65',
  '3\tAPEX PREDATORS\t2\t26\t31\t57',
  '4\tVORTEX ESPORTS\t1\t24\t28\t52',
  '5\tBENGAL TIGERS\t1\t22\t24\t46',
  '6\tROGUE SQUAD\t1\t18\t23\t41',
  '7\tNIGHT RAIDERS\t0\t20\t19\t39',
  '8\tCRIMSON FURY\t1\t15\t21\t36',
  '9\tNOVA TITANS\t0\t16\t17\t33',
  '10\tINFERNO X\t0\t14\t15\t29',
  '11\tCYBER WOLVES\t0\t10\t13\t23',
  '12\tDELTA FORCE\t0\t8\t10\t18',
].join('\n');

function toNonNegativeInt(raw: string | undefined): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[^0-9.-]/g, '');
  const parsed = Number.parseFloat(cleaned);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.round(parsed));
}

function isLikelyNumeric(raw: string | undefined): boolean {
  if (!raw) return false;
  const trimmed = raw.trim();
  if (!trimmed) return false;
  return /^#?\d+([.,]\d+)?$/.test(trimmed);
}

function splitLine(line: string): string[] {
  if (line.includes('\t')) {
    return line.split('\t').map((cell) => cell.trim());
  }
  if (line.includes('|')) {
    return line
      .split('|')
      .map((cell) => cell.trim())
      .filter((cell, i, arr) => !(cell === '' && (i === 0 || i === arr.length - 1)));
  }
  if (line.includes(',')) {
    const csvCells: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        csvCells.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    csvCells.push(current.trim());
    return csvCells;
  }
  return line.trim().split(/\s{2,}/).map((cell) => cell.trim());
}

interface ColumnMap {
  rankIdx: number;
  nameIdx: number;
  winIdx: number;
  placementIdx: number;
  finishIdx: number;
  totalIdx: number;
}

function detectHeaderMap(cells: string[]): ColumnMap | null {
  const normalized = cells.map((c) => c.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const hasKeyword = normalized.some((c) =>
    ['team', 'teamname', 'name', 'squad', 'win', 'wins', 'booyah', 'placement', 'place', 'pos', 'position', 'finish', 'kill', 'kills', 'total', 'pts', 'points'].includes(c)
  );
  if (!hasKeyword) return null;

  const findIdx = (patterns: RegExp[]): number =>
    normalized.findIndex((cell) => patterns.some((p) => p.test(cell)));

  return {
    rankIdx: findIdx([/^rank$/, /^no$/, /^sl$/, /^pos$/]),
    nameIdx: findIdx([/team/, /name/, /squad/, /clan/]),
    winIdx: findIdx([/win/, /booyah/, /^wwcd$/]),
    placementIdx: findIdx([/place/, /position/, /pospt/, /rankpt/]),
    finishIdx: findIdx([/finish/, /kill/, /elim/, /frag/]),
    totalIdx: findIdx([/total/, /^pts$/, /^point/, /score/]),
  };
}

export function recalculateAndSortTeams(
  teams: TeamRow[],
  autoSort: boolean,
  autoCalculateTotal: boolean
): TeamRow[] {
  const normalized = teams.map((team, idx) => {
    const win = Math.max(0, Math.round(team.win || 0));
    const placement = Math.max(0, Math.round(team.placement || 0));
    const finish = Math.max(0, Math.round(team.finish || 0));
    const total = autoCalculateTotal ? placement + finish : Math.max(0, Math.round(team.total || 0));
    return {
      ...team,
      win,
      placement,
      finish,
      total,
      rank: idx + 1,
    };
  });

  if (autoSort) {
    normalized.sort((a, b) => {
      const aEmpty = a.total === 0 && a.win === 0 && a.placement === 0 && a.finish === 0 && /^TEAM \d+$/i.test(a.name.trim());
      const bEmpty = b.total === 0 && b.win === 0 && b.placement === 0 && b.finish === 0 && /^TEAM \d+$/i.test(b.name.trim());
      if (aEmpty !== bEmpty) return aEmpty ? 1 : -1;
      if (b.total !== a.total) return b.total - a.total;
      if (b.win !== a.win) return b.win - a.win;
      if (b.placement !== a.placement) return b.placement - a.placement;
      if (b.finish !== a.finish) return b.finish - a.finish;
      return a.rank - b.rank;
    });
  }

  return normalized.slice(0, MAX_TABLE_SLOTS).map((team, idx) => ({
    ...team,
    rank: idx + 1,
  }));
}

export function parseGoogleSheetText(
  rawText: string,
  options: ParseSheetOptions = {},
  existingTeams?: TeamRow[]
): ParseSheetResult {
  const autoSort = options.autoSort ?? true;
  const autoCalculateTotal = options.autoCalculateTotal ?? false;
  const warnings: string[] = [];

  const lines = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return {
      teams: createDefaultTeams(),
      parsedCount: 0,
      warnings: ['Paste rows copied from Google Sheets (tab, comma, or spaced columns).'],
      detectedFormat: 'empty',
    };
  }

  const firstCells = splitLine(lines[0]);
  const headerMap = detectHeaderMap(firstCells);
  const dataLines = headerMap ? lines.slice(1) : lines;

  if (dataLines.length === 0) {
    return {
      teams: createDefaultTeams(),
      parsedCount: 0,
      warnings: ['Only a header row was found. Include team rows underneath the header.'],
      detectedFormat: 'header-only',
    };
  }

  const delimiter = lines[0].includes('\t')
    ? 'Google Sheets TSV'
    : lines[0].includes('|')
      ? 'Pipe-separated'
      : lines[0].includes(',')
        ? 'CSV'
        : 'Space-aligned';

  // Preserve crown/cup flags by team name if re-importing
  const existingAwardMap = new Map<string, { hasCrown: boolean; hasCup: boolean }>();
  if (existingTeams) {
    for (const t of existingTeams) {
      existingAwardMap.set(t.name.trim().toLowerCase(), {
        hasCrown: t.hasCrown,
        hasCup: t.hasCup,
      });
    }
  }

  const parsedRows: TeamRow[] = [];

  for (let i = 0; i < dataLines.length; i++) {
    const cells = splitLine(dataLines[i]);
    if (cells.length === 0 || cells.every((c) => c.trim() === '')) continue;

    let name = '';
    let win = 0;
    let placement = 0;
    let finish = 0;
    let total = 0;
    let explicitTotalProvided = false;

    if (headerMap && headerMap.nameIdx >= 0) {
      name = (cells[headerMap.nameIdx] ?? '').trim();
      if (!name) continue;
      win = headerMap.winIdx >= 0 ? toNonNegativeInt(cells[headerMap.winIdx]) : 0;
      placement = headerMap.placementIdx >= 0 ? toNonNegativeInt(cells[headerMap.placementIdx]) : 0;
      finish = headerMap.finishIdx >= 0 ? toNonNegativeInt(cells[headerMap.finishIdx]) : 0;
      if (headerMap.totalIdx >= 0 && cells[headerMap.totalIdx] !== undefined && cells[headerMap.totalIdx] !== '') {
        total = toNonNegativeInt(cells[headerMap.totalIdx]);
        explicitTotalProvided = true;
      } else {
        total = placement + finish;
      }
    } else {
      // Heuristic column detection when header is absent
      // Check if col 0 is numeric rank (e.g., "1", "01", "#1") and col 1 is a team name (or blank name cell)
      if (cells.length === 1 && isLikelyNumeric(cells[0])) continue;
      if (cells.length >= 2 && cells.every((c) => c === '' || isLikelyNumeric(c))) continue;

      const hasLeadingRank = cells.length >= 2 && isLikelyNumeric(cells[0]) && !isLikelyNumeric(cells[1]);
      const offset = hasLeadingRank ? 1 : 0;
      const remaining = cells.slice(offset);

      name = (remaining[0] ?? '').trim();
      if (!name) continue;

      if (remaining.length >= 5) {
        // Team | Win | Placement | Finish | Total
        win = toNonNegativeInt(remaining[1]);
        placement = toNonNegativeInt(remaining[2]);
        finish = toNonNegativeInt(remaining[3]);
        total = toNonNegativeInt(remaining[4]);
        explicitTotalProvided = true;
      } else if (remaining.length === 4) {
        // Team | Win | Placement | Finish (auto total)
        win = toNonNegativeInt(remaining[1]);
        placement = toNonNegativeInt(remaining[2]);
        finish = toNonNegativeInt(remaining[3]);
        total = placement + finish;
      } else if (remaining.length === 3) {
        // Team | Placement | Finish (auto total)
        placement = toNonNegativeInt(remaining[1]);
        finish = toNonNegativeInt(remaining[2]);
        total = placement + finish;
      } else if (remaining.length === 2) {
        // Team | Total
        total = toNonNegativeInt(remaining[1]);
        explicitTotalProvided = true;
      }
    }

    if (autoCalculateTotal || !explicitTotalProvided) {
      total = placement + finish;
    }

    const cleanName = name.trim();
    if (!cleanName) continue;
    const prevAwards = existingAwardMap.get(cleanName.toLowerCase());

    parsedRows.push({
      id: `team-${i + 1}-${Date.now()}`,
      rank: parsedRows.length + 1,
      name: cleanName,
      win,
      placement,
      finish,
      total,
      hasCrown: prevAwards?.hasCrown ?? false,
      hasCup: prevAwards?.hasCup ?? false,
    });
  }

  if (parsedRows.length === 0) {
    return {
      teams: [],
      parsedCount: 0,
      warnings: ['No team names were found in the pasted rows. Make sure each row includes a team name.'],
      detectedFormat: delimiter,
    };
  }

  if (parsedRows.length > MAX_TABLE_SLOTS) {
    warnings.push(`Parsed ${parsedRows.length} teams; displaying the top ${MAX_TABLE_SLOTS} rows so the poster stays readable.`);
  }

  const sorted = recalculateAndSortTeams(parsedRows, autoSort, autoCalculateTotal);

  return {
    teams: sorted.map((t, idx) => ({ ...t, id: `team-${idx + 1}`, rank: idx + 1 })),
    parsedCount: parsedRows.length,
    warnings,
    detectedFormat: delimiter,
  };
}
