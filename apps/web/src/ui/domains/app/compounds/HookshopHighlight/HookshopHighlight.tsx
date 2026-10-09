/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { Box, Image } from '@ds/primitives';
import { Hookshot } from '../Hookshot';
import { Mascot } from '../Mascot';
import { BEHIND_BAG, EFFECTS, LAYOUT, STYLES } from './behavior/scene.constants';
import { SOURCES } from './behavior/sprite-sources.constants';
import { LABEL } from './HookshopHighlight.constants';
import type { HookshopHighlightProps } from './HookshopHighlight.type';
import './HookshopHighlight.css';

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
