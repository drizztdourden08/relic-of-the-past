/* @layer renderer-components @kind types */
import type { RandomizerFormState } from './build-randomizer-config';

interface RandomizerFieldsProps {
  value: RandomizerFormState;
  onChange: (next: RandomizerFormState) => void;
  experimental: boolean;
}

export type { RandomizerFieldsProps };
