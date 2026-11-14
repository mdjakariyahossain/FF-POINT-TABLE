import { PosterDesignConfig, PosterHeader, SavedDesign, TeamRow } from '../types/pointTable';
import { createDefaultDesignConfig, DEFAULT_HEADER, extractRowColorsFromImagePixels } from './colorThemes';
import { createDefaultTeams } from './sheetParser';

const WORKSPACE_STORAGE_KEY = 'ff_point_table_workspace_v1';
const SAVED_DESIGNS_STORAGE_KEY = 'ff_point_table_saved_designs_v1';

export interface WorkspaceState {
  header: PosterHeader;
  teams: TeamRow[];
  design: PosterDesignConfig;
  autoSort: boolean;
  autoCalculateTotal: boolean;
}

export function loadWorkspaceState(): WorkspaceState {
  const fallback: WorkspaceState = {
    header: { ...DEFAULT_HEADER },
    teams: createDefaultTeams(),
    design: createDefaultDesignConfig(),
    autoSort: true,
    autoCalculateTotal: false,
  };

  try {
    const raw = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<WorkspaceState>;
    return {
      header: { ...fallback.header, ...(parsed.header ?? {}) },
      teams:
        Array.isArray(parsed.teams) && parsed.teams.length > 0
          ? parsed.teams.slice(0, 20).map((t, idx) => ({ ...t, rank: idx + 1 }))
          : fallback.teams,
      design: { ...fallback.design, ...(parsed.design ?? {}) },
      autoSort: typeof parsed.autoSort === 'boolean' ? parsed.autoSort : fallback.autoSort,
      autoCalculateTotal:
        typeof parsed.autoCalculateTotal === 'boolean'
          ? parsed.autoCalculateTotal
          : fallback.autoCalculateTotal,
    };
  } catch {
    return fallback;
  }
}

export function saveWorkspaceState(state: WorkspaceState): boolean {
  try {
    window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    // If customBgDataUrl exceeds quota, save without the large image payload
    try {
      const compactState: WorkspaceState = {
        ...state,
        design: { ...state.design, customBgDataUrl: null, bgMode: state.design.bgMode === 'custom-image' ? 'preset' : state.design.bgMode },
      };
      window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(compactState));
    } catch {
      // Ignore storage failures
    }
    return false;
  }
}

export function loadSavedDesigns(): SavedDesign[] {
  try {
    const raw = window.localStorage.getItem(SAVED_DESIGNS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomDesign(
  name: string,
  config: PosterDesignConfig,
  header?: PosterHeader
): { designs: SavedDesign[]; error?: string } {
  const trimmed = name.trim();
  if (!trimmed) {
    return { designs: loadSavedDesigns(), error: 'Please enter a design name.' };
  }

  const current = loadSavedDesigns();
  const newDesign: SavedDesign = {
    id: `design-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: trimmed,
    createdAt: Date.now(),
    config: { ...config },
    header: header ? { ...header } : undefined,
  };

  const next = [newDesign, ...current];
  try {
    window.localStorage.setItem(SAVED_DESIGNS_STORAGE_KEY, JSON.stringify(next));
    return { designs: next };
  } catch {
    return {
      designs: current,
      error: 'Browser storage is full. Delete an older custom design or use a smaller background image.',
    };
  }
}

export function deleteSavedDesign(id: string): SavedDesign[] {
  const next = loadSavedDesigns().filter((d) => d.id !== id);
  try {
    window.localStorage.setItem(SAVED_DESIGNS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore
  }
  return next;
}

export function saveSavedDesigns(designs: SavedDesign[]): void {
  try {
    window.localStorage.setItem(SAVED_DESIGNS_STORAGE_KEY, JSON.stringify(designs));
  } catch {
    // Ignore storage quota issues
  }
}

/**
 * Resizes uploaded background image to a crisp 1280x1280 max JPEG/WebP DataURL
 * so it saves reliably in localStorage, and extracts matching row gradient colors.
 */
export async function processUploadedBackgroundImage(file: File): Promise<{
  dataUrl: string;
  rowStart: string;
  rowEnd: string;
  titleColor: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file.'));
      img.onload = () => {
        const maxDim = 1200;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const targetW = Math.max(1, Math.round(img.width * scale));
        const targetH = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable.'));
          return;
        }
        ctx.drawImage(img, 0, 0, targetW, targetH);

        // Extract dominant palette from a tiny 24x24 sample
        const sampleCanvas = document.createElement('canvas');
        sampleCanvas.width = 24;
        sampleCanvas.height = 24;
        const sCtx = sampleCanvas.getContext('2d');
        let extracted = {
          rowStart: '#F6BDFF',
          rowEnd: '#8B89E8',
          titleColor: '#0D0E12',
        };
        if (sCtx) {
          sCtx.drawImage(img, 0, 0, 24, 24);
          const pixels = sCtx.getImageData(0, 0, 24, 24).data;
          extracted = extractRowColorsFromImagePixels(pixels, 24, 24);
        }

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        resolve({
          dataUrl,
          ...extracted,
        });
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
