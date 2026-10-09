/* @layer renderer-lib @kind logic */
import type { DebugReportSaveEntry } from '@shared/types/debug-report';
import { captureStateBuffer } from '@app/lib/game/state-buffers';
import * as savesStore from '../storage/saves-store';
import { AUTO_SAVES_IN_REPORT, NORMAL_SAVES_IN_REPORT } from './collect-save-states.constants';

const byNewest = <T extends { timestamp: number }>(a: T, b: T): number => b.timestamp - a.timestamp;

const collectSaveStates = async (profileId: string): Promise<DebugReportSaveEntry[]> => {
  const [quickSlots, normalSaves, autoSaves] = await Promise.all([
    savesStore.getSlotInfos(profileId),
    savesStore.listNormalSaves(profileId),
    savesStore.listAutoSaves(profileId),
  ]);
  const normalRecent = [...normalSaves].sort(byNewest).slice(0, NORMAL_SAVES_IN_REPORT);
  const autoRecent = [...autoSaves].sort(byNewest).slice(0, AUTO_SAVES_IN_REPORT);

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
