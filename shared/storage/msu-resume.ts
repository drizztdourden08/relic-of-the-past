/* @layer shared-storage @kind logic */
/**
 * The per-save music-resume sidecar: `{save}.msu.json` written next to the save it
 * belongs to. A sidecar rather than a manifest field because quick slots have no
 * manifest at all, so this is the one mechanism that fits all three save kinds.
 *
 * Lifetime is owned by the save that it shadows — ./saves and ./save-manifest clear
 * it whenever that save is written or deleted, so a fresh save can never inherit the
 * previous one's music position. A caller persisting a new snapshot therefore writes
 * it AFTER the save bytes, never before.
 */
import type { FileStore } from '@shared/platform';
import type { MsuResumeState } from '@shared/types/msu-manifest';
import { kindDir, msuSidecarPath, saveStem, type SaveKind } from './save-paths';

const resumePath = (profile: string, kind: SaveKind, id: string | number): string =>
  msuSidecarPath(kindDir(profile, kind), saveStem(kind, id));

const isResumeState = (value: unknown): value is MsuResumeState => {
  const s = value as MsuResumeState | null;
  return !!s && typeof s.trackNum === 'number' && !!s.layers && typeof s.layers === 'object';
};

const writeMsuResume = (files: FileStore, profile: string, kind: SaveKind, id: string | number,
  state: MsuResumeState): Promise<void> =>
  files.writeText(resumePath(profile, kind, id), `${JSON.stringify(state, null, 2)}\n`);

const readMsuResume = async (files: FileStore, profile: string, kind: SaveKind,
  id: string | number): Promise<MsuResumeState | null> => {
  const text = await files.readText(resumePath(profile, kind, id));
  if (text == null) return null;
  try {
    const parsed: unknown = JSON.parse(text);
    return isResumeState(parsed) ? parsed : null;
  } catch { return null; }
};

const deleteMsuResume = (files: FileStore, profile: string, kind: SaveKind, id: string | number): Promise<void> =>
  files.remove(resumePath(profile, kind, id));

export { resumePath, writeMsuResume, readMsuResume, deleteMsuResume };
