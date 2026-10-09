/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { Box, Image } from '@ds/primitives';
import { layoutHookshot } from './behavior/hookshot-layout';
import { SOURCES } from './behavior/sprite-sources.constants';
import type { HookshotProps, PlacedSprite } from './Hookshot.type';
import './Hookshot.css';

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
