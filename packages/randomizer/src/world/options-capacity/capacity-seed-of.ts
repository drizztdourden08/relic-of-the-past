/* @layer shared-game @kind logic */
import { entryOf } from '../../checked-access';
import { maxSpanOf } from '../capacity/capacity-family';
import { capacityKeyOf } from '../capacity/capacity-option-keys';
import {
  CAPACITY_CURVE_CHOICES, CAPACITY_MODE_CHOICES, DEFAULT_CAPACITY_ROWS, WALLET_MODE_CHOICES,
} from './capacity-option-choices.constants';
import { capacityLadderChoices } from './capacity-ladder-choices';
import type { CapacityFamily } from '../capacity/capacity-family';
import type { CapacityField } from '../capacity/capacity-option-keys';
import type { OptionSeed } from '../options.type';

const rungNounOf = (family: CapacityFamily): string => (family.id === 'meter' ? 'tier' : 'max');

const capacitySeedOf = (capacityFamily: CapacityFamily, field: CapacityField): OptionSeed => {
  const { id, label } = capacityFamily;
  const key = capacityKeyOf(id, field);
  const value = entryOf(DEFAULT_CAPACITY_ROWS, key);
  const base = { key, group: 'items' as const, implementation: 'active' as const, locked: false, synthetic: true, sourceDefault: value, baseline: value };
  switch (field) {
    case 'mode':
      return { ...base, displayName: `${label} upgrades`, kind: 'choice', choices: id === 'wallet' ? WALLET_MODE_CHOICES : CAPACITY_MODE_CHOICES };
    case 'start':
      return { ...base, displayName: `${label} starting ${rungNounOf(capacityFamily)}`, kind: 'choice', choices: capacityLadderChoices(capacityFamily) };
    case 'max':
      return { ...base, displayName: `${label} final ${rungNounOf(capacityFamily)}`, kind: 'choice', choices: capacityLadderChoices(capacityFamily) };
    case 'count':
      return { ...base, displayName: `${label} upgrade count`, kind: 'range', range: { min: 1, max: maxSpanOf(capacityFamily) } };
    case 'curve':
      return { ...base, displayName: `${label} upgrade curve`, kind: 'choice', choices: CAPACITY_CURVE_CHOICES };
    case 'jumps':
      return { ...base, displayName: `${label} upgrade jumps`, kind: 'text' };
  }
};

export { capacitySeedOf };
