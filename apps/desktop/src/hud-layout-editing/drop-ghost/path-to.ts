/* @layer renderer-components @kind logic */
import { ancestorIdsOf } from '../tree-context';
import { nodeName } from '../node-name';
import type { HudLayout } from '@rotp/hud';
import type { Translate } from '../translate.type';

const pathTo = (doc: HudLayout, id: string, t: Translate): string =>
  [...ancestorIdsOf(doc, id), id].map((each) => nodeName(each, t)).join(' › ');

export { pathTo };
