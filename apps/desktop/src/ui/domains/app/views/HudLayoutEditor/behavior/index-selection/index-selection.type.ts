/* @layer renderer-components @kind types */
interface IndexRun {
  indices: readonly number[];
  anchor: number;
}

interface PressModifiers {
  readonly shiftKey: boolean;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
}

export type { IndexRun, PressModifiers };
