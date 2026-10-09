/* @layer renderer-components @kind logic */
import type { CSSProperties } from 'react';
import type { PartName, PlacedPart } from '../HookshopHighlight.type';

const boxStyle = <P extends PartName>(p: PlacedPart<P>): CSSProperties => ({
  '--part-x': p.left,
  '--part-y': p.top,
  '--part-w': p.width,
  '--part-h': p.height,
  '--part-angle': `${p.angle}deg`,
  '--part-ox': p.originX,
  '--part-oy': p.originY,
}) as CSSProperties;

export { boxStyle };
