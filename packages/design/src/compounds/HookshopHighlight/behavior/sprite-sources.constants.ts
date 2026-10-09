/* @layer renderer-components @kind constants */
import bagSrc from '../../../assets/hookshop/hookshop-bag.svg';
import stampSrc from '../../../assets/hookshop/hookshop-stamp.svg';
import sparkleSrc from '../../../assets/hookshop/hookshop-sparkle.svg';
import starSrc from '../../../assets/hookshop/hookshop-star.svg';
import speedLineSrc from '../../../assets/hookshop/hookshop-speed-line.svg';
import type { SpriteName } from '../HookshopHighlight.type';

const SOURCES: Record<SpriteName, string> = {
  bag: bagSrc,
  stamp: stampSrc,
  sparkle: sparkleSrc,
  star: starSrc,
  speedLine: speedLineSrc,
};

export { SOURCES };
