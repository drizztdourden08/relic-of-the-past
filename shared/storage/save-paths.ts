/* @layer shared-storage @kind logic */
/**
 * The save-folder layout, in one place: the three save kinds and the sidecar files
 * that sit next to a save. Quick slots are bare `save{N}.sav` with no manifest,
 * normal/auto saves are `{id}.sav` tracked in `manifest.json`. Anything stored per save,
 * like the music-resume snapshot, therefore keys off a name and not a manifest entry.
 */

type SaveKind = 'quick' | 'normal' | 'auto';

const savesDir = (profile: string): string => `profiles/${profile}/saves`;
const quickDir = (profile: string): string => `${savesDir(profile)}/quick`;
const kindDir = (profile: string, kind: SaveKind): string => `${savesDir(profile)}/${kind}`;

/** The filename stem a save's own files share (`save3` for quick slot 3, the id otherwise). */
const saveStem = (kind: SaveKind, id: string | number): string => (kind === 'quick' ? `save${id}` : String(id));

/** What a save's music-resume sidecar adds to its stem. */
const MSU_SIDECAR_SUFFIX = '.msu.json';

/** The music-resume sidecar beside a save, addressed by its directory + stem. */
const msuSidecarPath = (dir: string, stem: string): string => `${dir}/${stem}${MSU_SIDECAR_SUFFIX}`;

export { MSU_SIDECAR_SUFFIX, savesDir, quickDir, kindDir, saveStem, msuSidecarPath };
export type { SaveKind };
