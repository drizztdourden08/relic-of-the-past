/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import * as savesStore from '../../storage/saves-store';
import { saveMusicPosition } from '../msu-save-glue';
import { getModule, getProfileId } from '@rotp/game-core';
import { captureGameFrameBlob } from '@rotp/game-core';
import { withDialogState } from '../state-dialog';
import type { AutoSaveTrigger } from '@rotp/game-core';
import { AUTO_SAVE_SLOT } from '@rotp/game-core';

const captureScreenshot = async (): Promise<ArrayBuffer | undefined> => {
  const blob = await captureGameFrameBlob();
  return blob ? await blob.arrayBuffer() : undefined;
};

const performAutoSave = async (trigger: AutoSaveTrigger): Promise<boolean> => {
  const mod = getModule();
  const profileId = getProfileId();
  if (!mod || !profileId) return false;

  try {
    log.app(`[AutoSave] Creating ${trigger} auto-save...`);

    mod.ccall('WasmSaveState', null, ['number'], [AUTO_SAVE_SLOT]);

    const savePath = `/saves/save${AUTO_SAVE_SLOT}.sav`;
    const { exists } = mod.FS.analyzePath(savePath);
    if (!exists) {
      log.app('[AutoSave] ABORT: file not found in MEMFS after ccall');
      return false;
    }

    const data = mod.FS.readFile(savePath);
    const ab = withDialogState(mod, (data.buffer as ArrayBuffer).slice(data.byteOffset, data.byteOffset + data.byteLength));

    const screenshot = await captureScreenshot();

    const created = await savesStore.createAutoSave(profileId, trigger, ab, screenshot);
    if (created?.id) await saveMusicPosition(profileId, 'auto', created.id);
    log.app(`[AutoSave] ${trigger} auto-save created (${(ab.byteLength / 1024).toFixed(0)} KB)`);

    try { mod.FS.unlink(savePath); } catch { return true; }

    return true;
  } catch (err) {
    log.error(`[AutoSave] EXCEPTION: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
};

export { performAutoSave };
