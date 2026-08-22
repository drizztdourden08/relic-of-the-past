/* @layer electron-main @kind logic */
/**
 * Per-save music-resume sidecars over Node fs — `{save}.msu.json` written beside the
 * save it belongs to. Quick slots carry no manifest, so a sidecar is the one mechanism
 * that fits all three save kinds; the naming comes from shared/storage/save-paths so
 * the renderer's FileStore path and this one address the same file.
 */
import { dirname } from 'path';
import { readFile, writeFile, rm, mkdir } from 'fs/promises';
import type { MsuResumeState } from '@shared/types/msu-manifest';
import type { SaveKind } from '@shared/storage/save-paths';
import { MSU_SIDECAR_SUFFIX, saveStem } from '@shared/storage/save-paths';
import { handle } from '../lib/ipc/handle';
import { getUserDataPath } from '../lib/paths';

const SAVE_KINDS: readonly SaveKind[] = ['quick', 'normal', 'auto'];

const resumeFile = (profileId: string, kind: SaveKind, id: string | number): string => {
  if (!SAVE_KINDS.includes(kind)) throw new Error(`Unknown save kind: ${kind}`);
  const stem = saveStem(kind, id);
  if (stem.includes('..') || stem.includes('/') || stem.includes('\\')) throw new Error('Invalid save id');
  return getUserDataPath('profiles', profileId, 'saves', kind, `${stem}${MSU_SIDECAR_SUFFIX}`);
};

const registerMsuResumeHandlers = (): void => {
  handle('msu:readResume', async (_event, profileId: string, kind: SaveKind, id: string | number) => {
    let text: string;
    try { text = await readFile(resumeFile(profileId, kind, id), 'utf-8'); } catch { return null; }
    try { return JSON.parse(text) as MsuResumeState; } catch { return null; }
  });

  handle('msu:writeResume', async (_event, profileId: string, kind: SaveKind, id: string | number,
    state: MsuResumeState) => {
    const path = resumeFile(profileId, kind, id);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, `${JSON.stringify(state, null, 2)}\n`, 'utf-8');
  });

  handle('msu:deleteResume', (_event, profileId: string, kind: SaveKind, id: string | number) =>
    rm(resumeFile(profileId, kind, id), { force: true }));
};

export { registerMsuResumeHandlers };
