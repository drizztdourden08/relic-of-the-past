/* @layer renderer-components @kind logic */
import type { Paint } from '@rotp/hud';

const swatchOf = (paint: Paint | undefined): string | undefined => {
  if (paint === undefined) return undefined;
  if (typeof paint === 'string') return paint;
  if ('gradient' in paint) {
    const stops = paint.stops.map((stop) => `${stop.color} ${Math.round(stop.at * 100)}%`).join(', ');
    return paint.gradient === 'radial'
      ? `radial-gradient(circle, ${stops})`
      : `linear-gradient(${typeof paint.angle === 'number' ? paint.angle : 0}deg, ${stops})`;
  }
  return 'repeating-linear-gradient(45deg, #555 0 3px, #333 3px 6px)';
};

export { swatchOf };
