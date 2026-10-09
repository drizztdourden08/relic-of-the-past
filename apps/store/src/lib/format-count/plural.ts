/* @layer store-site @kind logic */
import { formatCount } from './format-count';

const plural = (n: number, one: string, many: string): string => `${formatCount(n)} ${n === 1 ? one : many}`;

export { plural };
