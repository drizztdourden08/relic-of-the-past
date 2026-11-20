/* @layer shared-game @kind logic */
import type { Text } from '@drizztdourden08/brock-core/i18n';
import type { OptionSeed, OptionValue } from '../options.type';

const askToggleSeed = (key: string, displayName: Text, value: OptionValue): OptionSeed => ({
  key, displayName, group: 'items', kind: 'toggle', implementation: 'active',
  locked: false, synthetic: true, sourceDefault: value, baseline: value,
});

export { askToggleSeed };
