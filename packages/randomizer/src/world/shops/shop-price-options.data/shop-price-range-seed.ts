/* @layer shared-game @kind logic */
import type { OptionSeed } from '../../options.type';

const shopPriceRangeSeed = (key: string, displayName: string, max: number, baseline: number): OptionSeed => ({
  key, displayName, group: 'shops', kind: 'range', implementation: 'active',
  range: { min: 0, max }, sourceDefault: baseline, baseline, locked: false, synthetic: true,
});

export { shopPriceRangeSeed };
