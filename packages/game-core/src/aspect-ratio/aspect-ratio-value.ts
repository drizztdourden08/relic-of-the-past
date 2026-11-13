/* @layer bridge-wasm @kind logic */
import { aspectRatioValue as brockAspectRatioValue } from '@drizztdourden08/brock-display/aspect-ratio';
import { ASPECT_LIMITS } from './aspect-ratio.constants';

const aspectRatioValue = (
  ratio: string,
  customW: number,
  customH: number,
  renderIntoNotch = true,
  keepOrientation = false,
): number =>
  brockAspectRatioValue(ratio, { customW, customH, limits: ASPECT_LIMITS, letterbox: !renderIntoNotch, keepOrientation });

export { aspectRatioValue };
