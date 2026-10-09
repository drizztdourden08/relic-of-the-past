/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { Box, Image } from '@drizztdourden08/tessera/primitives';
import { layoutMascot } from './behavior/mascot-layout';
import { SOURCES } from './behavior/piece-sources.constants';
import type { MascotProps, PlacedPiece } from './Mascot.type';
import './Mascot.css';

const pieceStyle = (p: PlacedPiece): CSSProperties => ({
  '--part-x': p.left,
  '--part-y': p.top,
  '--part-w': p.width,
  '--part-h': p.height,
  '--part-angle': `${p.angle}deg`,
  '--part-ox': p.originX,
  '--part-oy': p.originY,
}) as CSSProperties;

const Mascot = (props: MascotProps) => {
  const { look, podAngles, className } = props;
  const lookX = look?.[0] ?? 0, lookY = look?.[1] ?? 0;
  const podLeft = podAngles?.left ?? 0, podRight = podAngles?.right ?? 0;
  const pieces = useMemo(
    () => layoutMascot([lookX, lookY], { left: podLeft, right: podRight })
      .map((p, i) => ({ key: `${p.piece}-${i}`, src: SOURCES[p.piece], style: pieceStyle(p) })),
    [lookX, lookY, podLeft, podRight],
  );

  return (
    <Box className={className ? `mascot ${className}` : 'mascot'} aria-hidden="true">
      {pieces.map(({ key, src, style }) => (
        <Image key={key} className="mascot__piece" src={src} style={style} alt="" draggable={false} />
      ))}
    </Box>
  );
};

export { Mascot };
