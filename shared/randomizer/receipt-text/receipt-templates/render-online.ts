/* @layer shared-game @kind logic */
import { primary, secondary } from '../highlight-markup';

const renderOnline = (sender: string, item: string, world = 'their world'): string =>
  `${secondary(sender)} turned up your ${primary(item)} over in ${world}.`;

export { renderOnline };
