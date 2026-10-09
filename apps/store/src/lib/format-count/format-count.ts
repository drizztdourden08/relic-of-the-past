/* @layer store-site @kind logic */
import { GROUP } from './format-count.constants';

const formatCount = (n: number): string => String(Math.round(n)).replace(GROUP, ' ');

export { formatCount };
