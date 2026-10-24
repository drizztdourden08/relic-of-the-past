/* @layer renderer-components @kind types */
import type { RandomizerFormState } from './build-randomizer-config';

interface ArchipelagoFieldsProps {
  value: RandomizerFormState;
  onChange: (part: Partial<RandomizerFormState>) => void;
}

interface ArchipeliaFieldsProps extends ArchipelagoFieldsProps {
  joining?: boolean;
}

export type { ArchipelagoFieldsProps, ArchipeliaFieldsProps };
