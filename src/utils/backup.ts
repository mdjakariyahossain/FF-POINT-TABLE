import { PosterDesignConfig, PosterHeader, SavedDesign, TeamRow } from '../types/pointTable';
import { createDefaultDesignConfig, DEFAULT_HEADER } from './colorThemes';
import { createDefaultTeams, MAX_TABLE_SLOTS } from './sheetParser';
import { WorkspaceState } from './storage';

export interface PointTableBackupV1 {
  app: 'ff-point-table-studio';
  version: 1;
  exportedAt: string;
  workspace: WorkspaceState;
  savedDesigns: SavedDesign[];
}

export type ParseBackupResult =
  | {
      ok: true;
      data: PointTableBackupV1;
      summary: string;
    }
  | {
      ok: false;
      error: string;
    };

export function createBackupPayload(
  workspace: WorkspaceState,
  savedDesigns: SavedDesign[]
): PointTableBackupV1 {
  return {
    app: 'ff-point-table-studio',
    version: 1,
    exportedAt: new Date().toISOString(),
    workspace: {
      header: { ...workspace.header },
      teams: workspace.teams.map((t) => ({ ...t })),
      design: { ...workspace.design },
      autoSort: workspace.autoSort,
      autoCalculateTotal: workspace.autoCalculateTotal,
    },
    savedDesigns: savedDesigns.map((d) => ({
      ...d,
      config: { ...d.config },
      header: d.header ? { ...d.header } : undefined,
    })),
  };
}

export function serializeBackupJson(
  workspace: WorkspaceState,
  savedDesigns: SavedDesign[]
): string {
  const payload = createBackupPayload(workspace, savedDesigns);
  return JSON.stringify(payload, null, 2);
}

function normalizeTeamRow(raw: unknown, index: number): TeamRow {
  const defaultName = `TEAM ${index + 1}`;
  if (!raw || typeof raw !== 'object') {
    return {
      id: `team-${index + 1}`,
      rank: index + 1,
      name: defaultName,
      win: 0,
      placement: 0,
      finish: 0,
      total: 0,
      hasCrown: false,
      hasCup: false,
    };
  }
  const obj = raw as Partial<TeamRow>;
  const toInt = (val: unknown, def = 0) =>
    typeof val === 'number' && Number.isFinite(val) ? Math.max(0, Math.round(val)) : def;

  return {
    id: typeof obj.id === 'string' && obj.id ? obj.id : `team-${index + 1}`,
    rank: index + 1,
    name: typeof obj.name === 'string' && obj.name.trim() ? obj.name : defaultName,
    win: toInt(obj.win, 0),
    placement: toInt(obj.placement, 0),
    finish: toInt(obj.finish, 0),
    total: toInt(obj.total, 0),
    hasCrown: Boolean(obj.hasCrown),
    hasCup: Boolean(obj.hasCup),
  };
}

export function parseAndValidateBackupJson(rawJson: string): ParseBackupResult {
  if (!rawJson || !rawJson.trim()) {
    return { ok: false, error: 'The backup file is empty.' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return { ok: false, error: 'Invalid JSON file. Please select a valid FF Point Studio backup (.json).' };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, error: 'Backup file structure is not recognized.' };
  }

  const root = parsed as Partial<PointTableBackupV1>;
  if (root.app !== 'ff-point-table-studio') {
    return { ok: false, error: 'This JSON file is not an FF Point Studio backup.' };
  }

  if (!root.workspace || !Array.isArray(root.workspace.teams)) {
    return { ok: false, error: 'Backup file is missing team standings data.' };
  }

  const defaultDesign = createDefaultDesignConfig();
  const rawDesign = (root.workspace.design ?? {}) as Partial<PosterDesignConfig>;
  const rawHeader = (root.workspace.header ?? {}) as Partial<PosterHeader>;

  const rawTeams = root.workspace.teams.slice(0, MAX_TABLE_SLOTS);
  const normalizedTeams: TeamRow[] =
    rawTeams.length > 0
      ? rawTeams.map((row, idx) => normalizeTeamRow(row, idx))
      : createDefaultTeams();

  const normalizedHeader: PosterHeader = {
    dateText: typeof rawHeader.dateText === 'string' ? rawHeader.dateText : DEFAULT_HEADER.dateText,
    tournamentName:
      typeof rawHeader.tournamentName === 'string'
        ? rawHeader.tournamentName
        : DEFAULT_HEADER.tournamentName,
    subHeading:
      typeof rawHeader.subHeading === 'string' ? rawHeader.subHeading : DEFAULT_HEADER.subHeading,
    footerText:
      typeof rawHeader.footerText === 'string' ? rawHeader.footerText : DEFAULT_HEADER.footerText,
  };

  const normalizedDesign: PosterDesignConfig = {
    ...defaultDesign,
    ...rawDesign,
  };

  const normalizedSavedDesigns: SavedDesign[] = Array.isArray(root.savedDesigns)
    ? root.savedDesigns.filter(
        (d): d is SavedDesign =>
          Boolean(d && typeof d === 'object' && typeof d.id === 'string' && typeof d.name === 'string' && d.config)
      )
    : [];

  const normalizedBackup: PointTableBackupV1 = {
    app: 'ff-point-table-studio',
    version: 1,
    exportedAt: typeof root.exportedAt === 'string' ? root.exportedAt : new Date().toISOString(),
    workspace: {
      header: normalizedHeader,
      teams: normalizedTeams,
      design: normalizedDesign,
      autoSort: typeof root.workspace.autoSort === 'boolean' ? root.workspace.autoSort : true,
      autoCalculateTotal:
        typeof root.workspace.autoCalculateTotal === 'boolean'
          ? root.workspace.autoCalculateTotal
          : false,
    },
    savedDesigns: normalizedSavedDesigns,
  };

  const crownCount = normalizedTeams.filter((t) => t.hasCrown).length;
  const cupCount = normalizedTeams.filter((t) => t.hasCup).length;

  return {
    ok: true,
    data: normalizedBackup,
    summary: `Restored "${normalizedHeader.tournamentName}" (${normalizedTeams.length} teams, ${crownCount} crowns, ${cupCount} cups, ${normalizedSavedDesigns.length} saved designs).`,
  };
}

export function downloadBackupFile(
  workspace: WorkspaceState,
  savedDesigns: SavedDesign[]
): string {
  const json = serializeBackupJson(workspace, savedDesigns);
  const blob = new Blob([json], { type: 'application/json' });
  const slug = (workspace.header.tournamentName || 'ff-point-table')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32);
  const dateStamp = new Date().toISOString().slice(0, 10);
  const filename = `ff-backup-${slug || 'tournament'}-${dateStamp}.json`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  return filename;
}
