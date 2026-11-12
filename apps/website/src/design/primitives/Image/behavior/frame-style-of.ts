/* @layer website-site @kind logic */
import type { CSSProperties } from 'react';
import { DEFAULT_ASPECT_RATIO } from '../Image.constants';
import type { FrameStyleParams } from '../Image.type';

const lengthOf = (value: number | string): number | string => {
  const count = Number(value);
  return Number.isFinite(count) ? count : value;
};

const ratioOf = (width?: number | string, height?: number | string): string | undefined => {
  const across = Number(width);
  const down = Number(height);
  return across > 0 && down > 0 ? `${across} / ${down}` : undefined;
};

const sizeOf = (width?: number | string, height?: number | string): CSSProperties => {
  if (width !== undefined && width !== '') return { width: lengthOf(width) };
  if (height !== undefined && height !== '') return { width: 'auto', height: lengthOf(height) };
  return {};
};

const frameStyleOf = (params: FrameStyleParams): CSSProperties => {
  const { aspectRatio, width, height, naturalRatio, style } = params;
  const ratio = aspectRatio ?? ratioOf(width, height) ?? naturalRatio ?? DEFAULT_ASPECT_RATIO;
  return { aspectRatio: ratio, ...sizeOf(width, height), ...style };
};

export { frameStyleOf };
