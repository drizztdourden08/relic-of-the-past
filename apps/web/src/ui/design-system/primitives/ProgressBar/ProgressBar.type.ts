/* @layer renderer-components @kind types */
type ProgressVariant = 'gold' | 'green' | 'danger';

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  /** Optional second (lighter) fill behind the main one, e.g. reachable-vs-done. */
  secondaryValue?: number;
  /**
   * Set for a bar whose value is sampled continuously, not changed now and then. The fill
   * eases towards a new width by default, which reads well for an occasional jump and badly for a
   * live one: re-targeting the same transition every animation frame leaves the fill perpetually
   * chasing a value that has already moved, so it lags, overshoots and slides across whenever the
   * value resets. This turns the easing off so the fill IS the value.
   */
  live?: boolean;
  className?: string;
}

export type { ProgressBarProps, ProgressVariant };
