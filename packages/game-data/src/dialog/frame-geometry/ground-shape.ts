/* @layer shared-game @kind logic */
import type { DialogCorner } from '../box-style';
import type { GroundShape } from './frame-geometry.type';

const groundShape = (corner: DialogCorner, size: number): GroundShape => {
  if (corner === 'rounded') return { borderRadius: size };
  if (corner === 'chamfered') {
    const s = `${size}px`;
    const far = `calc(100% - ${s})`;
    return { clipPath: `polygon(${s} 0, ${far} 0, 100% ${s}, 100% ${far}, ${far} 100%, ${s} 100%, 0 ${far}, 0 ${s})` };
  }
  return {};
};

export { groundShape };
