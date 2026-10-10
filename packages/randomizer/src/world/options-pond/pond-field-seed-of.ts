/* @layer shared-game @kind logic */
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
      return { ...base, displayName: `${pond.label} throws`, kind: 'range', range: { min: 1, max: POND_MAX_THROWS } };
    case 'items':
      return { ...base, displayName: `${pond.label} pool items`, kind: 'range', range: { min: 0, max: POND_MAX_ITEMS } };
    case 'curve':
      return { ...base, displayName: `${pond.label} price curve`, kind: 'choice', choices: POND_CURVE_CHOICES };
    case 'jumps':
      return { ...base, displayName: `${pond.label} price jumps`, kind: 'text' };
  }
};

export { pondFieldSeedOf };
