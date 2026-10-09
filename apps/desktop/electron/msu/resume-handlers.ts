/* @layer electron-main @kind logic */
import { dirname } from 'path';
import { readFile, writeFile, rm, mkdir } from 'fs/promises';
import type { MsuResumeState } from '@rotp/game-data';
import type { SaveKind } from '@rotp/game-core';
import { MSU_SIDECAR_SUFFIX, saveStem } from '@rotp/game-core';
import { handle, getUserDataPath } from '@drizztdourden08/brock-electron/main';
import { SAVE_KINDS } from './resume-handlers.constants';

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
