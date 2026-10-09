/* @layer electron-main @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import * as saves from '@shared/storage/saves';
import type { CollectedSaves, SaveInReport } from './bug-report.type';
import { AUTO_SAVES_IN_REPORT, NORMAL_SAVES_IN_REPORT } from './bug-report.constants';
import { collectQuickSlots } from './collect-quick-slots';

const newestFirst = <T extends { timestamp: number }>(list: T[], keep: number): T[] =>
  [...list].sort((a, b) => b.timestamp - a.timestamp).slice(0, keep);

const collectReportSaves = async (files: FileStore, profileId: string, liveState: ArrayBuffer | null): Promise<CollectedSaves> => {
  const out: CollectedSaves ={ entries: [], saves: [] };
  const add = (save: SaveInReport, bytes: Uint8Array | null): void => {
    if (!bytes) return;
    out.saves.push(save);
    out.entries.push({ name: `save/${save.kind}-${save.ref}.sav`, data: Buffer.from(bytes) });
  };

  const [quick, normal, auto] = await Promise.all([
    collectQuickSlots(files, profileId),
    saves.listNormalSaves(files, profileId),
    saves.listAutoSaves(files, profileId),
  ]);
  for (const slot of quick) add({ kind: 'quick', ref: String(slot.slot), savedAt: slot.savedAt }, slot.bytes);
  for (const save of newestFirst(normal, NORMAL_SAVES_IN_REPORT)) {
    add({ kind: 'normal', ref: save.id, savedAt: save.timestamp }, await saves.loadNormalSave(files, profileId, save.id));
  }
  for (const save of newestFirst(auto, AUTO_SAVES_IN_REPORT)) {
    add({ kind: 'auto', ref: save.id, savedAt: save.timestamp }, await saves.loadAutoSave(files, profileId, save.id));
  }
  if (liveState) add({ kind: 'live', ref: 'live', savedAt: Date.now() }, new Uint8Array(liveState));
  return out;
};

export { collectReportSaves };
