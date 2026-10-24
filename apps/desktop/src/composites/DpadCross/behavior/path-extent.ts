/* @layer renderer-components @kind logic */
import { PATH_NUMBER } from './glyph-path.constants';
import type { PathExtent } from '../DpadCross.type';

const pathExtent = (data: string): PathExtent => {
  const numbers = (data.match(PATH_NUMBER) ?? []).map(Number);
  const min = Math.min(...numbers);
  return { min, span: Math.max(...numbers) - min };
};

export { pathExtent };
