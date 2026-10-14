/* @layer renderer-components @kind logic */
import type { HidAxisMapping, StickCandidate } from '../hid-calibration.type';

const describeAxisCandidate = (c: StickCandidate): { mapping: HidAxisMapping; result: string } => ({
  mapping: { byteIndex: c.idx, center: c.center, min: c.min, max: c.max, inverted: false },
  result: `byte[${c.idx}] ${c.min}..${c.center}..${c.max} (range ${c.range})`,
});

export { describeAxisCandidate };
