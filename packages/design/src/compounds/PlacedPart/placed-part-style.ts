/* @layer renderer-components @kind logic */
import type { CSSProperties } from 'react';
import type { PlacedBox } from './PlacedPart.type';

const placedPartStyle = (p: PlacedBox): CSSProperties => ({
  '--part-x': p.left,
  '--part-y': p.top,
  '--part-w': p.width,
  '--part-h': p.height,
  '--part-angle': `${p.angle}deg`,
  '--part-ox': p.originX,
  '--part-oy': p.originY,
}) as CSSProperties;

export { placedPartStyle };
