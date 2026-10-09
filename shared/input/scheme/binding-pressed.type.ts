/* @layer shared-input @kind types */
interface GamepadSample {
  readonly buttons: readonly boolean[];
  readonly axes: readonly number[];
}

interface InputSample {
  readonly keys: ReadonlySet<string>;
  readonly pads: readonly GamepadSample[];
  readonly axisThreshold?: number;
  readonly triggerThreshold?: number;
}

export type { GamepadSample, InputSample };
