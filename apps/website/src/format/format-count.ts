/* @layer website-site @kind logic */
import { THOUSAND } from './format-count.constants';

const formatCount = (count: number): string =>
  count >= THOUSAND ? `${(count / THOUSAND).toFixed(1)}k` : String(count);

export { formatCount };
