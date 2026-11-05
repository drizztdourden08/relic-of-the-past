/* @layer renderer-components @kind component */
import { useContext, useMemo } from 'react';
import type { OptionsStepProps } from '@drizztdourden08/brock-randomizer';
import { buildOptionsSnapshot } from '@rotp/randomizer';
import { choicesOfSnapshot } from '@app/hooks/randomizer/choices-of-snapshot';
import { randomizerChoiceOverrides } from '@app/hooks/randomizer/randomizer-choices';
import { optionValuesOf } from '@app/randomizer/options/option-values-of';
import { OptionTabContext } from '@app/randomizer/wizard/option-tab-context';
import { RandomizerOptionsPanel } from '@app/views/DataManager/sub-components/profile-manager/RandomizerOptionsPanel';
import { wizardFactsOf } from '@app/randomizer/wizard/wizard-facts-of';

const OptionsStepSlot = ({ value, values, onChange }: OptionsStepProps) => {
  const { rom, seed, mode } = wizardFactsOf(values);
  const control = useContext(OptionTabContext);
  const choices = useMemo(
    () => choicesOfSnapshot(buildOptionsSnapshot(optionValuesOf(value.overrides)), seed),
    [value.overrides, seed],
  );
  return (
    <RandomizerOptionsPanel
      romFile={rom}
      seed={seed}
      value={choices}
      mode={mode}
      activeTab={control?.tab}
      onTabChange={control?.setTab}
      onChange={(next) => onChange({ overrides: { ...randomizerChoiceOverrides(next) } })}
    />
  );
};

export { OptionsStepSlot };
