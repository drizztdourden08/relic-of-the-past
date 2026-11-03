/* @layer renderer-components @kind component */
import { RandomizerOptionsPanel } from '../../../RandomizerOptionsPanel';
import type { OptionsStepProps } from './OptionsStep.type';

const OptionsStep = ({ values, update, tab, onTabChange }: OptionsStepProps) => {
  const { rom, randomizer } = values;

  return (
    <RandomizerOptionsPanel
      romFile={rom}
      seed={randomizer.seed}
      value={randomizer}
      mode={randomizer.mode}
      activeTab={tab}
      onTabChange={onTabChange}
      onChange={(next) => update({ randomizer: { ...randomizer, ...next } })}
    />
  );
};

export { OptionsStep };
