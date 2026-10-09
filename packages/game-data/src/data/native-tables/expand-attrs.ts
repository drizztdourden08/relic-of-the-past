/* @layer shared-game @kind logic */
import type { AttrRun } from './attr-group.type';

const runBytes = ({ from, to }: AttrRun): number[] => {
  const bytes: number[] = [];
  for (let attr = from; attr <= to; attr++) bytes.push(attr);
  return bytes;
};

const expandAttrs = (attrs: readonly (number | AttrRun)[]): number[] =>
  attrs.flatMap(entry => (typeof entry === 'number' ? [entry] : runBytes(entry)));

export { expandAttrs };
