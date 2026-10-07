/* @layer renderer-components @kind component */
/**
 * The Hookshop highlight: the mascot pulls in a shop bag with its hookshot. The mascot and
 * the hookshot are built from their own pieces; this component places and turns them from
 * the layout, and the sparkle, stars and speed lines exist only here. The hookshot crosses
 * the bag's side and is clipped at the front face's edge, so its point goes in behind the
 * front. The stars sit behind the bag. The stamp sits inside the bag's box, so it turns
 * with the bag. Scale it with `pixelSize`, the size of one mascot pixel.
 */
import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import bagSrc from '@app/assets/hookshop/hookshop-bag.svg';
import stampSrc from '@app/assets/hookshop/hookshop-stamp.svg';
import sparkleSrc from '@app/assets/hookshop/hookshop-sparkle.svg';
import starSrc from '@app/assets/hookshop/hookshop-star.svg';
import speedLineSrc from '@app/assets/hookshop/hookshop-speed-line.svg';
import { Box, Image } from '@ds/primitives';
import { Hookshot } from '../Hookshot';
import { Mascot } from '../Mascot';
import { computeLayout } from './behavior/scene-layout';
import { HOOKSHOP_PARTS } from './HookshopHighlight.constants';
import type { HookshopHighlightProps, PartName, PlacedPart } from './HookshopHighlight.type';
import './HookshopHighlight.css';

type SpriteName = Exclude<PartName, 'bot'>;

const SOURCES: Record<SpriteName, string> = {
  bag: bagSrc,
  stamp: stampSrc,
  sparkle: sparkleSrc,
  star: starSrc,
  speedLine: speedLineSrc,
};

const LAYOUT = computeLayout(HOOKSHOP_PARTS);

const boxStyle = <P extends PartName>(p: PlacedPart<P>): CSSProperties => ({
  '--part-x': p.left,
  '--part-y': p.top,
  '--part-w': p.width,
  '--part-h': p.height,
  '--part-angle': `${p.angle}deg`,
  '--part-ox': p.originX,
  '--part-oy': p.originY,
}) as CSSProperties;

const sprites = <P extends SpriteName>(parts: PlacedPart<P>[]) => parts.map((p, i) => ({
  key: `${p.part}-${i}`,
  src: SOURCES[p.part],
  style: boxStyle(p),
}));

const STYLES = {
  bot: boxStyle(LAYOUT.bot),
  bag: boxStyle(LAYOUT.bag),
  stamp: boxStyle(LAYOUT.stamp),
};
const BEHIND_BAG = sprites(LAYOUT.behindBag);
const EFFECTS = sprites(LAYOUT.effects);

const LABEL = 'Sentri, the Relic of the Past mascot, pulls a shop bag in with its hookshot';

const HookshopHighlight = (props: HookshopHighlightProps) => {
  const { pixelSize = 4, className } = props;
  const rootStyle = useMemo(() => ({
    '--px': `${pixelSize}px`,
    '--scene-w': LAYOUT.width,
    '--scene-h': LAYOUT.height,
  }) as CSSProperties, [pixelSize]);

  return (
    <Box className={className ? `hookshop-highlight ${className}` : 'hookshop-highlight'} style={rootStyle} role="img" aria-label={LABEL}>
      <Box className="hookshop-highlight__part" style={STYLES.bot}>
        <Mascot />
      </Box>
      {BEHIND_BAG.map(({ key, src, style }) => (
        <Image key={key} className="hookshop-highlight__part" src={src} style={style} alt="" draggable={false} />
      ))}
      <Box className="hookshop-highlight__part" style={STYLES.bag}>
        <Image className="hookshop-highlight__fill" src={SOURCES.bag} alt="" draggable={false} />
        <Image className="hookshop-highlight__part" src={SOURCES.stamp} style={STYLES.stamp} alt="" draggable={false} />
      </Box>
      <Hookshot curve={LAYOUT.hookshot} clip={LAYOUT.hookshotClip} />
      {EFFECTS.map(({ key, src, style }) => (
        <Image key={key} className="hookshop-highlight__part" src={src} style={style} alt="" draggable={false} />
      ))}
    </Box>
  );
};

export { HookshopHighlight };
