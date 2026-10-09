/* @layer renderer-components @kind logic */
import { ancestorIdsOf } from '../tree-context';
import type { HudLayout } from '@rotp/hud';

const pathTo = (doc: HudLayout, id: string): string =>
  [...ancestorIdsOf(doc, id), id].join(' › ');

export { pathTo };
