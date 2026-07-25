/* @layer renderer-lib @kind logic */
/**
 * Installs the screen display-name overlay from `public/names.json`.
 *
 * The screen datasets in this repository carry the structure and a neutral,
 * descriptive name for every screen. The human-readable names transcribed from
 * the original game ship separately, in the private companion repo, and land here
 * as a gitignored `names.json` synced by `scripts/vault/sync.mjs`.
 *
 * Absence is the normal case for a plain clone: no file, no overlay, and every
 * screen shows the neutral name the dataset already carries. So every failure
 * path here is a silent no-op — a 404, a parse error and a malformed payload all
 * leave the app fully functional, just less readable.
 */
import { setNameOverlay } from '@shared/game/data/screens';
import { log } from '../log-bus';
import { publicAsset } from './public-asset';

/** A payload only counts when `names` is an object of string values. */
const readNames = (payload: unknown): Record<string, string> | null => {
  if (typeof payload !== 'object' || payload === null) return null;
  const { names } = payload as { names?: unknown };
  if (typeof names !== 'object' || names === null || Array.isArray(names)) return null;
  const entries = Object.entries(names).filter(([, v]) => typeof v === 'string');
  return entries.length > 0 ? (Object.fromEntries(entries) as Record<string, string>) : null;
};

/** Never rejects: the overlay is additive, so a missing file must not fail boot. */
const loadNameOverlay = async (): Promise<void> => {
  try {
    const res = await fetch(publicAsset('names.json'));
    if (!res.ok) return;
    const names = readNames(await res.json());
    if (!names) return;
    setNameOverlay(names);
    log.app(`Display names loaded (${Object.keys(names).length} screens)`);
  } catch {
    // No file, no network, not JSON — all expected without the companion repo.
  }
};

export { loadNameOverlay };
