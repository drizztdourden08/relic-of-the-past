/* @layer shared-game @kind logic */
import type { Text } from '@drizztdourden08/brock-core/i18n';
import type { OptionSeed } from '../options.type';

const shopToggleSeed = (key: string, displayName: Text, baseline: boolean): OptionSeed => ({
  key, displayName, group: 'shops', kind: 'toggle', implementation: 'active',
  sourceDefault: baseline, baseline, locked: false, synthetic: true,
});

export { shopToggleSeed };
