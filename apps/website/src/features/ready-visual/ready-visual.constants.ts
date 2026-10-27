/* @layer website-site @kind data */
import { degradeAudio } from './degrade-audio';
import { degradeCloud } from './degrade-cloud';
import { degradeCollage } from './degrade-collage';
import { degradeCompare } from './degrade-compare';
import { degradeIcons } from './degrade-icons';
import { degradeLens } from './degrade-lens';
import { degradePicker } from './degrade-picker';
import { degradePins } from './degrade-pins';
import { degradeRatios } from './degrade-ratios';
import { degradeSingle } from './degrade-single';
import { degradeTitle } from './degrade-title';
import { degradeVideo } from './degrade-video';
import type { Degraders } from './ready-visual.type';

const DEGRADERS: Degraders = {
  single: degradeSingle,
  compare: degradeCompare,
  picker: degradePicker,
  ratios: degradeRatios,
  lens: degradeLens,
  collage: degradeCollage,
  pins: degradePins,
  title: degradeTitle,
  icons: degradeIcons,
  video: degradeVideo,
  cloud: degradeCloud,
  audio: degradeAudio,
};

export { DEGRADERS };
