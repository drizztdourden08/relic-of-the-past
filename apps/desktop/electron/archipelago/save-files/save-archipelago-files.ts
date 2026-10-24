/* @layer electron-main @kind logic */
/**
 * Writes what an Archipelago host needs for one slot into a folder the player picks: the player
 * file (<slot>.yaml) and the world package, both handed over by the renderer, the package under
 * the name Archipelago loads it by.
 */
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { WORLD_MODULE_NAME } from '@rotp/randomizer';
import { errMessage } from '../../lib/result';
import { pickFolder } from './pick-folder';
import { safeFileStem } from './safe-file-stem';
import { CANCELLED_REASON } from './save-files.constants';
import type { ArchipelagoSaveFilesRequest, ArchipelagoSaveFilesResult } from '@app/ipc';

const saveArchipelagoFiles = async (request: ArchipelagoSaveFilesRequest): Promise<ArchipelagoSaveFilesResult> => {
  const { slotName, yaml, apworld } = request;
  const folder = await pickFolder();
  if (folder === null) return { ok: false, reason: CANCELLED_REASON };

  const yamlPath = join(folder, `${safeFileStem(slotName)}.yaml`);
  const worldPath = join(folder, `${WORLD_MODULE_NAME}.apworld`);
  try {
    await writeFile(yamlPath, yaml, 'utf8');
    await writeFile(worldPath, Buffer.from(apworld));
  } catch (err) {
    return { ok: false, reason: errMessage(err) };
  }
  return { ok: true, folder, files: [yamlPath, worldPath] };
};

export { saveArchipelagoFiles };
