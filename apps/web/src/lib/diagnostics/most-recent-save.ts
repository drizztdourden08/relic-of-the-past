/* @layer renderer-lib @kind logic */
/** Finds whichever save state (quick, normal, or auto) a profile saved most recently, so the
 *  floating debug-report button can attach one without asking the player which kind it was. */
import type { DebugReportSource } from '@shared/types/debug-report';
import * as savesStore from '../storage/saves-store';

interface MostRecentSave {
  source: DebugReportSource;
  buffer: ArrayBuffer;
  screenshotBase64: string | null;
}

const getMostRecentSave = async (profileId: string): Promise<MostRecentSave | null> => {
  const [quickSlots, normalSaves, autoSaves] = await Promise.all([
    savesStore.getSlotInfos(profileId),
    savesStore.listNormalSaves(profileId),
    savesStore.listAutoSaves(profileId),
  ]);

  const candidates: DebugReportSource[] = [
    ...quickSlots.map((s) => ({ kind: 'quick' as const, ref: String(s.slot), savedAt: s.timestamp })),
    ...normalSaves.map((s) => ({ kind: 'normal' as const, ref: s.id, savedAt: s.timestamp })),
    ...autoSaves.map((s) => ({ kind: 'auto' as const, ref: s.id, savedAt: s.timestamp })),
  ];
  if (candidates.length === 0) return null;

  const source = candidates.reduce((a, b) => (b.savedAt > a.savedAt ? b : a));

  const [buffer, screenshotBase64] = await (
    source.kind === 'quick' ? Promise.all([
      savesStore.readState(profileId, Number(source.ref)),
      savesStore.readScreenshot(profileId, Number(source.ref)),
    ])
    : source.kind === 'normal' ? Promise.all([
      savesStore.loadNormalSave(profileId, source.ref),
      savesStore.loadNormalScreenshot(profileId, source.ref),
    ])
    : Promise.all([
      savesStore.loadAutoSave(profileId, source.ref),
      savesStore.loadAutoScreenshot(profileId, source.ref),
    ])
  );
  if (!buffer) return null;

  return { source, buffer, screenshotBase64 };
};

export { getMostRecentSave };
export type { MostRecentSave };
