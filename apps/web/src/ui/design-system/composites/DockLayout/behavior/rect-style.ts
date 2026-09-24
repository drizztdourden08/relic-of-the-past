/* @layer renderer-components @kind logic */
/** An absolutely positioned box for a layout rect, in stage pixels. */
import type { CSSProperties } from 'react';
import type { Rect } from '@shared/types/widget-layout';

const rectStyle = (rect: Rect): CSSProperties =>
  ({ left: rect.x, top: rect.y, width: rect.width, height: rect.height });

const sameRect = (a: Rect | null, b: Rect | null): boolean =>
  a === b || (!!a && !!b && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height);

export { rectStyle, sameRect };
