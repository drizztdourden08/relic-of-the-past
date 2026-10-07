/* @layer renderer-components @kind logic */
/**
 * Splits a subsection's items into contiguous runs by lock cause, so a block of
 * neighbouring items locked for the same reason gets ONE overlay (one message, one
 * action) instead of each item wearing its own. A lone locked item between unlocked
 * ones still gets its own small overlay, but a whole locked block reads as a single
 * covered region. Runs with different causes never merge: each keeps its own copy.
 */
import type { SettingItem, SettingLockCause } from '../SettingsLayout.type';

interface ItemRun {
  /** null when the run is unlocked. */
  lock: SettingLockCause | null;
  items: SettingItem[];
}

const partitionByLockState = (items: SettingItem[], lockOf: (key: string) => SettingLockCause | null): ItemRun[] => {
  const runs: ItemRun[] = [];
  for (const item of items) {
    const lock = lockOf(item.key);
    const current = runs[runs.length - 1];
    if (current && current.lock === lock) {
      current.items.push(item);
    } else {
      runs.push({ lock, items: [item] });
    }
  }
  return runs;
};

export { partitionByLockState };
export type { ItemRun };
