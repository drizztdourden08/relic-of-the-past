/* @layer shared-game @kind logic */
import type { OptionSeed, OptionValue } from '../options.type';

const askToggleSeed = (key: string, displayName: string, value: OptionValue): OptionSeed => ({
  key, displayName, group: 'items', kind: 'toggle', implementation: 'active',
  locked: false, synthetic: true, sourceDefault: value, baseline: value,
});

export { askToggleSeed };
