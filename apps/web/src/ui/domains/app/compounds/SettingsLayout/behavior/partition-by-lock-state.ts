/* @layer renderer-components @kind logic */
import type { ItemRun, SettingItem, SettingLockCause } from '../SettingsLayout.type';

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
