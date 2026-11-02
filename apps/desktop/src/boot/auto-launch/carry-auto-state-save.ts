/* @layer renderer-app @kind logic */
import type { NormalSaveInfo } from '@rotp/game-core';
import type { TestArgs } from '@app/ipc';
import { log } from '@app/log-bus';
import { createNormalSave, listNormalSaves, loadNormalSave } from '@app/storage/saves-store';

const namedSave = async (profileId: string, name: string): Promise<NormalSaveInfo | null> => {
  const wanted = name.trim().toLowerCase();
  return (await listNormalSaves(profileId)).find((save) => save.name.toLowerCase() === wanted) ?? null;
};

const carryAutoStateSave = async (from: Profile, to: Profile, autoState: TestArgs['autoState']): Promise<void> => {
  if (typeof autoState !== 'string' || from.id === to.id || from.romFile !== to.romFile) return;
  if ((await namedSave(to.id, autoState)) !== null) return;
  const source = await namedSave(from.id, autoState);
  if (source === null) return;
  const data = await loadNormalSave(from.id, source.id);
  if (data === null) return;
  await createNormalSave(to.id, source.name, data);
  log.app(`[AutoTest] Copied the manual save "${source.name}" from profile "${from.name}" to "${to.name}"`);
};

export { carryAutoStateSave };
