/* @layer shared-game @kind logic */
import { primary } from '../highlight-markup/primary';
import { secondary } from '../highlight-markup/secondary';

const renderOnline = (sender: string, item: string, world = 'their world'): string =>
  `${secondary(sender)} turned up your ${primary(item)} over in ${world}.`;

export { renderOnline };
