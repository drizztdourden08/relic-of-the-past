/* @layer shared-game @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
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

const capacitySeedOf = (capacityFamily: CapacityFamily, field: CapacityField): OptionSeed => {
  const { id } = capacityFamily;
  const key = capacityKeyOf(id, field);
  const value = entryOf(DEFAULT_CAPACITY_ROWS, key);
  const base = { key, group: 'items' as const, implementation: 'active' as const, locked: false, synthetic: true, sourceDefault: value, baseline: value };
  switch (field) {
    case 'mode':
      return { ...base, displayName: msg('randomizer-world:tpl.capacity.mode', { family: id }), kind: 'choice', choices: id === 'wallet' ? WALLET_MODE_CHOICES : CAPACITY_MODE_CHOICES };
    case 'start':
      return { ...base, displayName: msg('randomizer-world:tpl.capacity.start', { family: id }), kind: 'choice', choices: capacityLadderChoices(capacityFamily) };
    case 'max':
      return { ...base, displayName: msg('randomizer-world:tpl.capacity.final', { family: id }), kind: 'choice', choices: capacityLadderChoices(capacityFamily) };
    case 'count':
      return { ...base, displayName: msg('randomizer-world:tpl.capacity.count', { family: id }), kind: 'range', range: { min: 1, max: maxSpanOf(capacityFamily) } };
    case 'curve':
      return { ...base, displayName: msg('randomizer-world:tpl.capacity.curve', { family: id }), kind: 'choice', choices: CAPACITY_CURVE_CHOICES };
    case 'jumps':
      return { ...base, displayName: msg('randomizer-world:tpl.capacity.jumps', { family: id }), kind: 'text' };
  }
};

export { capacitySeedOf };
