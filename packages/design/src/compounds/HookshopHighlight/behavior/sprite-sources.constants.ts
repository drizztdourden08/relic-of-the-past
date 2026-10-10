/* @layer renderer-components @kind constants */
import bagSrc from '../../../../art/hookshop/hookshop-bag.svg';
import stampSrc from '../../../../art/hookshop/hookshop-stamp.svg';
import sparkleSrc from '../../../../art/hookshop/hookshop-sparkle.svg';
import starSrc from '../../../../art/hookshop/hookshop-star.svg';
import speedLineSrc from '../../../../art/hookshop/hookshop-speed-line.svg';
import type { SpriteName } from '../HookshopHighlight.type';

const SOURCES: Record<SpriteName, string> = {
  bag: bagSrc,
  stamp: stampSrc,
  sparkle: sparkleSrc,
  star: starSrc,
  speedLine: speedLineSrc,
};

export { SOURCES };
