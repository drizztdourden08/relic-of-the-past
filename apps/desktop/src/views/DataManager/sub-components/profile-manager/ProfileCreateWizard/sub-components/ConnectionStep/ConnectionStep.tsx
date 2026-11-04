/* @layer renderer-components @kind component */
import { ArchipelagoFields } from '../../../ArchipelagoFields';
import { ArchipeliaFields } from '../../../ArchipeliaFields';
import type { RandomizerFormState } from '../../../build-randomizer-config';
import type { ConnectionStepProps } from './ConnectionStep.type';

const ConnectionStep = ({ values, update }: ConnectionStepProps) => {
  const { randomizer } = values;
  const patch = (part: Partial<RandomizerFormState>) => update({ randomizer: { ...randomizer, ...part } });

  return randomizer.mode === 'archipelia'
    ? <ArchipeliaFields value={randomizer} onChange={patch} />
    : <ArchipelagoFields value={randomizer} onChange={patch} />;
};

export { ConnectionStep };
