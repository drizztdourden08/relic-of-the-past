/* @layer renderer-lib @kind logic */
/** Gathers every save state a debug report packages: all quick slots, the 5 newest normal
 *  saves, the 2 newest auto-saves, plus one fresh 'live' capture of whatever is on screen
 *  right now. The live capture never touches the profile's own save stores (captureStateBuffer
 *  writes to a scratch WASM slot and unlinks it immediately), so packaging a report never
 *  creates a save the player didn't ask for. */
import type { DebugReportSaveEntry } from '@shared/types/debug-report';
import { captureStateBuffer } from '@app/lib/game/save-states';
import * as savesStore from '../storage/saves-store';

const NORMAL_LIMIT = 5;
const AUTO_LIMIT = 2;

const byNewest = <T extends { timestamp: number }>(a: T, b: T): number => b.timestamp - a.timestamp;

const collectSaveStates = async (profileId: string): Promise<DebugReportSaveEntry[]> => {
  const [quickSlots, normalSaves, autoSaves] = await Promise.all([
    savesStore.getSlotInfos(profileId),
    savesStore.listNormalSaves(profileId),
    savesStore.listAutoSaves(profileId),
  ]);
  const normalRecent = [...normalSaves].sort(byNewest).slice(0, NORMAL_LIMIT);
  const autoRecent = [...autoSaves].sort(byNewest).slice(0, AUTO_LIMIT);

  const entries: DebugReportSaveEntry[] = [];

  for (const slot of quickSlots) {
    const buffer = await savesStore.readState(profileId, slot.slot);
    if (buffer) entries.push({ kind: 'quick', ref: String(slot.slot), savedAt: slot.timestamp, buffer });
  }
  for (const save of normalRecent) {
    const buffer = await savesStore.loadNormalSave(profileId, save.id);
    if (buffer) entries.push({ kind: 'normal', ref: save.id, savedAt: save.timestamp, buffer });
  }
  for (const save of autoRecent) {
    const buffer = await savesStore.loadAutoSave(profileId, save.id);
    if (buffer) entries.push({ kind: 'auto', ref: save.id, savedAt: save.timestamp, buffer });
  }

  const live = captureStateBuffer();
  if (live) entries.push({ kind: 'live', ref: 'live', savedAt: Date.now(), buffer: live });

  return entries;
};

export { collectSaveStates };
