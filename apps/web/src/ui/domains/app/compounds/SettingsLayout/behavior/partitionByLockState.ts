/* @layer renderer-components @kind logic */
/**
 * Splits a subsection's items into contiguous runs of locked vs. unlocked, so a block of
 * neighbouring locked items gets ONE overlay (one message, one "Open Settings" button) instead
 * of each item wearing its own — a lone locked item between unlocked ones still gets its own
 * small overlay, but a whole locked block reads as a single covered region.
 */
import type { SettingItem } from '../SettingsLayout.type';

interface ItemRun {
  locked: boolean;
  items: SettingItem[];
}

const partitionByLockState = (items: SettingItem[], isLocked: (key: string) => boolean): ItemRun[] => {
  const runs: ItemRun[] = [];
  for (const item of items) {
    const locked = isLocked(item.key);
    const current = runs[runs.length - 1];
    if (current && current.locked === locked) {
      current.items.push(item);
    } else {
      runs.push({ locked, items: [item] });
    }
  }
  return runs;
};

export { partitionByLockState };
export type { ItemRun };
