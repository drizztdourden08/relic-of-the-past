/* @layer bridge-wasm @kind logic */
import { aspectRatioValue as brockAspectRatioValue } from '@drizztdourden08/brock-display/aspect-ratio';
import { ASPECT_LIMITS } from './aspect-ratio.constants';
import type { AspectRatioValueOptions } from './aspect-ratio-value.type';

const aspectRatioValue = ({
  ratio,
  customW,
  customH,
  renderIntoNotch = true,
  keepOrientation = false,
}: AspectRatioValueOptions): number =>
  brockAspectRatioValue(ratio, { customW, customH, limits: ASPECT_LIMITS, letterbox: !renderIntoNotch, keepOrientation });

export { aspectRatioValue };
