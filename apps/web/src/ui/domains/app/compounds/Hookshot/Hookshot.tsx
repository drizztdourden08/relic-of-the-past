/* @layer renderer-components @kind component */
/**
 * The hookshot: handle, chain links and head, each its own pixel-art sprite, laid along a
 * curve. The links follow the curve pin to pin, so any path works without redrawing the
 * art. It fills its positioned parent and sizes itself from the parent's --px, the size
 * of one mascot pixel.
 */
import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import handleSrc from '@app/assets/hookshop/hookshot-handle.svg';
import linkFaceSrc from '@app/assets/hookshop/hookshot-link-face.svg';
import linkEdgeSrc from '@app/assets/hookshop/hookshot-link-edge.svg';
import headSrc from '@app/assets/hookshop/hookshot-head.svg';
import { Box, Image } from '@ds/primitives';
import { layoutHookshot } from './behavior/hookshot-layout';
import type { HookshotProps, PlacedSprite, SpriteName } from './Hookshot.type';
import './Hookshot.css';

const SOURCES: Record<SpriteName, string> = {
  handle: handleSrc,
  linkFace: linkFaceSrc,
  linkEdge: linkEdgeSrc,
  head: headSrc,
};

const spriteStyle = (p: PlacedSprite): CSSProperties => ({
  '--part-x': p.left,
  '--part-y': p.top,
  '--part-w': p.width,
  '--part-h': p.height,
  '--part-angle': `${p.angle}deg`,
  '--part-ox': p.originX,
  '--part-oy': p.originY,
}) as CSSProperties;

const clipStyle = (clip: HookshotProps['clip']): CSSProperties | undefined => (clip
  ? { clipPath: `polygon(${clip.map(([x, y]) => `calc(${x} * var(--px)) calc(${y} * var(--px))`).join(', ')})` }
  : undefined);

const Hookshot = (props: HookshotProps) => {
  const { curve, clip, className } = props;
  const sprites = useMemo(() => {
    const { links, handle, head } = layoutHookshot(curve);
    return [...links, handle, head].map((p, i) => ({ key: `${p.sprite}-${i}`, src: SOURCES[p.sprite], style: spriteStyle(p) }));
  }, [curve]);
  const style = useMemo(() => clipStyle(clip), [clip]);

  return (
    <Box className={className ? `hookshot ${className}` : 'hookshot'} style={style} aria-hidden="true">
      {sprites.map(({ key, src, style }) => (
        <Image key={key} className="hookshot__sprite" src={src} style={style} alt="" draggable={false} />
      ))}
    </Box>
  );
};

export { Hookshot };
