/* @layer shared-game @kind types */
interface LedgeStep {
  dr: number;
  dc: number;
  dir: 'n' | 's' | 'e' | 'w';
}

export type { LedgeStep };
