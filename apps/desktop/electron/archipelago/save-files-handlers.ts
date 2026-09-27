/* @layer electron-main @kind logic */
/**
 * `archipelago:save-files`: writes what an Archipelago host needs for this
 * profile's slot into a folder the player picks. That is the player file
 * (<slot>.yaml, rendered from the profile's frozen options) and a copy of the
 * bundled world package. A cancelled picker is reported as a reason, since
 * nothing was written.
 */
import { app, dialog } from 'electron';
import type { OpenDialogOptions } from 'electron';
import { copyFile, writeFile } from 'fs/promises';
import { basename, join } from 'path';
import { renderPlayerYaml } from '@shared/randomizer/archipelago/player-yaml';
import { deliverableSetsOf } from '@shared/randomizer/world/fill/deliverable-lists';
import type { ArchipelagoSaveFilesResult } from '@shared/types/archipelago-files';
import { handle } from '../lib/ipc/handle';
import { getMainWindow } from '../window';
import { loadProfile } from '../profiles';
import { resolveWorldPackagePath } from './world-package-path';

/** Characters Windows refuses in a file name, plus control characters. */
const UNSAFE_FILENAME = /[<>:"/\\|?*\u0000-\u001f]/g;

const VANILLA_SPOTS_NOTICE = 'NPC, pond and world spots stay vanilla: recreate the profile to include them';

/** The slot a profile with no name of its own connects as (useRandomizerBoot.ts), so the file names the same slot. */
const DEFAULT_SLOT_NAME = 'Player';

const safeFileStem = (name: string): string => name.replace(UNSAFE_FILENAME, '_').trim() || DEFAULT_SLOT_NAME;

const FOLDER_DIALOG: OpenDialogOptions = {
  title: 'Save Archipelago files',
  properties: ['openDirectory', 'createDirectory'],
};

const pickFolder = async (): Promise<string | null> => {
  const mainWindow = getMainWindow();
  const result = mainWindow
    ? await dialog.showOpenDialog(mainWindow, FOLDER_DIALOG)
    : await dialog.showOpenDialog(FOLDER_DIALOG);
  return result.canceled || result.filePaths.length === 0 ? null : result.filePaths[0];
};

const saveArchipelagoFiles = async (profileId: string): Promise<ArchipelagoSaveFilesResult> => {
  const profile = await loadProfile(profileId);
  if (!profile) return { ok: false, reason: 'profile not found' };
  const config = profile.randomizer;
  if (!config) return { ok: false, reason: 'profile is not randomized' };
  const worldPackage = resolveWorldPackagePath();
  if (!worldPackage) return { ok: false, reason: 'world package not built' };

  const folder = await pickFolder();
  if (!folder) return { ok: false, reason: 'cancelled' };

  const slotName = config.slotName?.trim() || DEFAULT_SLOT_NAME;
  // A profile from before the probed spots were recorded proves none: all stay vanilla.
  const deliverable = config.deliverable ? deliverableSetsOf(config.deliverable) : {};
  const yaml = renderPlayerYaml({
    slotName, options: config.options, appVersion: app.getVersion(), seedText: config.seed, deliverable,
    deathLink: config.deathLink === true,
  });
  const yamlPath = join(folder, `${safeFileStem(slotName)}.yaml`);
  const worldCopy = join(folder, basename(worldPackage));
  try {
    await writeFile(yamlPath, yaml, 'utf8');
    await copyFile(worldPackage, worldCopy);
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }
  const files = [yamlPath, worldCopy];
  return config.deliverable ? { ok: true, folder, files } : { ok: true, folder, files, notice: VANILLA_SPOTS_NOTICE };
};

const registerArchipelagoHandlers = (): void => {
  handle('archipelago:save-files', (_event, profileId) => saveArchipelagoFiles(profileId));
};

export { registerArchipelagoHandlers };
