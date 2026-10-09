/* @layer shared-game @kind logic */
import type { NameTable, PauseLabelKey } from '../types';

const kPauseLabelKeys: PauseLabelKey[] = [
  'item', 'equipment', 'dungeon-item', 'crystals', 'pendants', 'do',
];

const defaultLabel = (key: PauseLabelKey): string => key.replace(/-/g, ' ').toUpperCase();

const emptyNameTable = (): NameTable => ({
  items: {},
  bottles: {},
  labels: Object.fromEntries(
    kPauseLabelKeys.map((key) => [key, defaultLabel(key)]),
  ) as Record<PauseLabelKey, string>,
});

export { emptyNameTable };
