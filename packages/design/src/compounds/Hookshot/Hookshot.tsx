/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { PlacedPart } from '../PlacedPart';
import { layoutHookshot } from './behavior/hookshot-layout';
import { SOURCES } from './behavior/sprite-sources.constants';
import type { HookshotProps } from './Hookshot.type';

const clipStyle = (clip: HookshotProps['clip']): CSSProperties | undefined => (clip
  ? { clipPath: `polygon(${clip.map(([x, y]) => `calc(${x} * var(--px)) calc(${y} * var(--px))`).join(', ')})` }
  : undefined);

const Hookshot = (props: HookshotProps) => {
  const { curve, clip, className } = props;
  const sprites = useMemo(() => {
    const { links, handle, head } = layoutHookshot(curve);
    return [...links, handle, head].map((p, i) => ({ key: `${p.sprite}-${i}`, src: SOURCES[p.sprite], box: p }));
  }, [curve]);
  const style = useMemo(() => clipStyle(clip), [clip]);

  return (
    <Box className={className ? `placed-layer ${className}` : 'placed-layer'} style={style} aria-hidden="true">
      {sprites.map(({ key, src, box }) => (
        <PlacedPart key={key} box={box} src={src} />
      ))}
    </Box>
  );
};

export { Hookshot };
