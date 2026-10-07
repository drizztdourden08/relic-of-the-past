/* @layer renderer-components @kind component */
/**
 * Sentri, the Relic of the Past mascot, built from its pieces: body, visor, two eyes and two pods.
 * The eyes can look around and each pod can turn, so a scene can pose it without new art.
 * It fills its positioned parent and sizes itself from the parent's --px, the size of one
 * mascot pixel.
 */
import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import bodySrc from '@app/assets/mascot/mascot-body.svg';
import visorSrc from '@app/assets/mascot/mascot-visor.svg';
import eyeSrc from '@app/assets/mascot/mascot-eye.svg';
import podLeftSrc from '@app/assets/mascot/mascot-pod-left.svg';
import podRightSrc from '@app/assets/mascot/mascot-pod-right.svg';
import { Box, Image } from '@ds/primitives';
import { layoutMascot } from './behavior/mascot-layout';
import type { MascotProps, PieceName, PlacedPiece } from './Mascot.type';
import './Mascot.css';

const SOURCES: Record<PieceName, string> = {
  body: bodySrc,
  visor: visorSrc,
  eye: eyeSrc,
  podLeft: podLeftSrc,
  podRight: podRightSrc,
};

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
