/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import type { OptionTabProps } from '@drizztdourden08/brock-randomizer';
import { buildOptionsSnapshot, parseCapacityProfile } from '@rotp/randomizer';
import type { OptionDef, OptionValue } from '@rotp/randomizer';
import { catalogByLock } from '@app/compounds/RandomizerOptionRow';
import { choicesOfSnapshot } from '@app/hooks/randomizer/choices-of-snapshot';
import { splitLockedGroups, splitUnlockedGroups } from '@app/hooks/randomizer/option-tab-model';
import { randomizerChoiceOverrides } from '@app/hooks/randomizer/randomizer-choices';
import type { RandomizerOptionChoices } from '@app/hooks/randomizer/randomizer-choices';
import { usePondDemands } from '@app/hooks/randomizer/usePondDemands';
import { usePoolImpacts } from '@app/hooks/randomizer/usePoolImpacts';
import { optionValuesOf } from '@app/randomizer/options/option-values-of';
import { choicesAfterRow } from '@app/views/DataManager/sub-components/profile-manager/randomizer-options/choices-after-row';
import { valueFor } from '@app/views/DataManager/sub-components/profile-manager/randomizer-options/value-for';
import type { RotpOptionModel } from './useRotpOptionModel.type';

const useRotpOptionModel = (props: OptionTabProps): RotpOptionModel => {
  const { overrides, seed, frozen, onChange } = props;
  const snapshot = useMemo(() => buildOptionsSnapshot(optionValuesOf(overrides)), [overrides]);
  const choices = useMemo(() => choicesOfSnapshot(snapshot, seed), [snapshot, seed]);
  const { accounting, error, cellOf } = usePoolImpacts(snapshot, seed);
  const notes = useMemo(() => parseCapacityProfile(snapshot.values).notes, [snapshot]);
  const pondDemands = usePondDemands(snapshot, seed);
  const groups = useMemo(() => splitUnlockedGroups(catalogByLock.unlockedGroups), []);
  const fixed = useMemo(() => splitLockedGroups(catalogByLock.lockedGroups), []);

  const valueOf = (option: OptionDef): OptionValue => (frozen
    ? snapshot.values[option.key] ?? option.baseline
    : valueFor(option, choices, snapshot.values));

  const handleChange = onChange === undefined || frozen
    ? undefined
    : (next: RandomizerOptionChoices) => onChange({ ...randomizerChoiceOverrides(next) });
  const handleRowChange = handleChange === undefined
    ? undefined
    : (key: string, next: OptionValue) => {
      const changed = choicesAfterRow(choices, key, next);
      if (changed !== choices) handleChange(changed);
    };

  return { snapshot, choices, accounting, error, cellOf, notes, pondDemands, groups, fixed, valueOf, handleChange, handleRowChange };
};

export { useRotpOptionModel };
