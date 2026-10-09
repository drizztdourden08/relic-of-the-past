/* @layer shared-game @kind logic */
import type { OptionSeed } from '../../options.type';

const shopPriceToggleSeed = (key: string, displayName: string, baseline: boolean): OptionSeed => ({
  key, displayName, group: 'shops', kind: 'toggle', implementation: 'active',
  sourceDefault: baseline, baseline, locked: false, synthetic: true,
});

export { shopPriceToggleSeed };
