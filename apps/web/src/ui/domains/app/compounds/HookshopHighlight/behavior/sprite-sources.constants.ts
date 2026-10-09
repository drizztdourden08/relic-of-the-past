/* @layer renderer-components @kind constants */
import bagSrc from '@app/assets/hookshop/hookshop-bag.svg';
import stampSrc from '@app/assets/hookshop/hookshop-stamp.svg';
import sparkleSrc from '@app/assets/hookshop/hookshop-sparkle.svg';
import starSrc from '@app/assets/hookshop/hookshop-star.svg';
import speedLineSrc from '@app/assets/hookshop/hookshop-speed-line.svg';
import type { SpriteName } from '../HookshopHighlight.type';

const SOURCES: Record<SpriteName, string> = {
  bag: bagSrc,
  stamp: stampSrc,
  sparkle: sparkleSrc,
  star: starSrc,
  speedLine: speedLineSrc,
};

export { SOURCES };
