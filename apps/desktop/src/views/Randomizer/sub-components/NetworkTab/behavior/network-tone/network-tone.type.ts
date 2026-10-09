/* @layer renderer-components @kind types */
import type { StatusTone } from '@drizztdourden08/tessera/primitives';

type Tone = StatusTone;

interface Chip {
  tone: Tone;
  label: string;
}

export type { Chip, Tone };
