/* @layer shared-game @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import { entryOf } from '../../checked-access';
import { POND_MAX_ITEMS, POND_MAX_THROWS } from '../pond/pond-ladder.constants';
import { pondKeyOf } from '../pond/pond-option-keys';
import { POND_CURVE_CHOICES, POND_MODE_CHOICES } from './pond-option-choices.constants';
import type { PondField } from '../pond/pond.type';
import type { PondInstance } from '../pond/pond-instance.type';
import type { OptionSeed, OptionValues } from '../options.type';

const pondFieldSeedOf = (pond: PondInstance, field: PondField, rows: OptionValues): OptionSeed => {
  const key = pondKeyOf(pond, field);
  const value = entryOf(rows, key);
  const base = { key, group: 'items' as const, implementation: 'active' as const, locked: false, synthetic: true, sourceDefault: value, baseline: value };
  switch (field) {
    case 'mode':
      return { ...base, displayName: pond.label, kind: 'choice', choices: POND_MODE_CHOICES };
    case 'throws':
      return { ...base, displayName: msg('randomizer-world:tpl.pond.throws', { pond: pond.label }), kind: 'range', range: { min: 1, max: POND_MAX_THROWS } };
    case 'items':
      return { ...base, displayName: msg('randomizer-world:tpl.pond.items', { pond: pond.label }), kind: 'range', range: { min: 0, max: POND_MAX_ITEMS } };
    case 'curve':
      return { ...base, displayName: msg('randomizer-world:tpl.pond.curve', { pond: pond.label }), kind: 'choice', choices: POND_CURVE_CHOICES };
    case 'jumps':
      return { ...base, displayName: msg('randomizer-world:tpl.pond.jumps', { pond: pond.label }), kind: 'text' };
  }
};

export { pondFieldSeedOf };
