/* @layer shared-game @kind logic */
import { pondValuesOf } from '../pond/pond-from-snapshot';
import { defaultPondSettingOf } from '../pond/pond-profile-defaults';
import { POND_FIELDS } from '../pond/pond-option-keys';
import { pondFieldSeedOf } from './pond-field-seed-of';
import { pondAskSeedsOf } from './pond-ask-seeds-of';
import type { PondInstance } from '../pond/pond-instance.type';
import type { OptionSeed } from '../options.type';

const pondSeedsOf = (pond: PondInstance): OptionSeed[] => {
  const rows = pondValuesOf(defaultPondSettingOf(pond.id), pond);
  return [...POND_FIELDS.map((field) => pondFieldSeedOf(pond, field, rows)), ...pondAskSeedsOf(pond, rows)];
};

export { pondSeedsOf };
