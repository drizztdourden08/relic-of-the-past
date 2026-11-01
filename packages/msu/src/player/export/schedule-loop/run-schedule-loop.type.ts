/* @layer renderer-lib @kind types */
type LoopStep = (buffer: AudioBuffer, at: number, isOpeningPass: boolean) => number;

export type { LoopStep };
