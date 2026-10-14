/* @layer renderer-widgets @kind logic */
import type { ScreenCrossing } from '@rotp/game-core';

const crossingSpanLabel = (crossing: ScreenCrossing): string => {
  if (!crossing.span) return '';
  const axis = crossing.side === 'north' || crossing.side === 'south' ? 'c' : 'r';
  return `${axis}${crossing.span.from}-${crossing.span.to}`;
};

export { crossingSpanLabel };
