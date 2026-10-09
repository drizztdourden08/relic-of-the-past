/* @layer electron-main @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import { quickDir } from '@rotp/game-core';
import type { QuickSlot } from './bug-report.type';
import { QUICK_SLOT_FILE } from './bug-report.constants';

const collectQuickSlots = async (files: FileStore, profileId: string): Promise<QuickSlot[]> => {
  const dir = quickDir(profileId);
  const names = (await files.list(dir).catch(() => [] as string[])).filter((name) => QUICK_SLOT_FILE.test(name)).sort();
  const slots: QuickSlot[] = [];
  for (const name of names) {
    const [stat, bytes] = await Promise.all([files.stat(`${dir}/${name}`), files.readBytes(`${dir}/${name}`)]);
    if (stat && bytes) slots.push({ slot: Number(QUICK_SLOT_FILE.exec(name)?.[1]), savedAt: stat.mtimeMs, bytes });
  }
  return slots;
};

export { collectQuickSlots };
