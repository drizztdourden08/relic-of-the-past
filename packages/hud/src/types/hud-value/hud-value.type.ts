/* @layer shared-types @kind types */
type Value = number | { from: 'data'; expr: string };

interface GradientStop { at: number; color: string }

type Paint =
  | string
  | { gradient: 'linear' | 'radial'; angle?: Value; stops: GradientStop[] }
  | { image: string; repeat?: 'none' | 'repeat' | 'repeat-x' | 'repeat-y'; size?: 'contain' | 'cover' | 'tile' };

export type { GradientStop, Paint, Value };
