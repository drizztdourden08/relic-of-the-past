/* @layer renderer-components @kind types */
type Tone = 'ok' | 'warn' | 'bad' | 'idle' | 'dim';

interface Chip {
  tone: Tone;
  label: string;
}

export type { Chip, Tone };
