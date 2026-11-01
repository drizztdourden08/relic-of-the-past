/* @layer website-site @kind logic */
import { CELL } from '../Separator.constants';

const repeat = (count: number, step: string): string => step.repeat(count);

const diamondPath = (cx: number, cy: number, radius: number): string => {
  const s = CELL;
  return [
    `M ${cx - s / 2} ${cy - (radius + 0.5) * s} h ${s}`,
    repeat(radius, ` v ${s} h ${s}`),
    ` v ${s}`,
    repeat(radius, ` h ${-s} v ${s}`),
    ` h ${-s}`,
    repeat(radius, ` v ${-s} h ${-s}`),
    ` v ${-s}`,
    repeat(radius, ` h ${s} v ${-s}`),
    ' z',
  ].join('');
};

export { diamondPath };
