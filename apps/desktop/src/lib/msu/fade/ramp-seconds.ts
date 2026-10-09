/* @layer renderer-lib @kind logic */
import { FRAMES_PER_SECOND } from './fade.constants';

const rampSeconds = (from: number, to: number, step: number): number =>
  Math.abs(to - from) / (step / 255) / FRAMES_PER_SECOND;

export { rampSeconds };
