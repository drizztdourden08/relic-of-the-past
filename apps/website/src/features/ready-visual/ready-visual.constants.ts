/* @layer website-site @kind data */
import { degradeClip } from './degrade-clip';
import { degradeCollage } from './degrade-collage';
import { degradeCompare } from './degrade-compare';
import { degradeLens } from './degrade-lens';
import { degradeOverlay } from './degrade-overlay';
import { degradePins } from './degrade-pins';
import { degradeSingle } from './degrade-single';
import type { Degraders } from './ready-visual.type';

const DEGRADERS: Degraders = {
  single: degradeSingle,
  compare: degradeCompare,
  overlay: degradeOverlay,
  lens: degradeLens,
  collage: degradeCollage,
  pins: degradePins,
  clip: degradeClip,
};

export { DEGRADERS };
