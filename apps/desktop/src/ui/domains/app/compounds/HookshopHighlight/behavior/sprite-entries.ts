/* @layer renderer-components @kind logic */
import type { PlacedPart, SpriteName } from '../HookshopHighlight.type';
import { boxStyle } from './box-style';
import { SOURCES } from './sprite-sources.constants';

const spriteEntries = <P extends SpriteName>(parts: PlacedPart<P>[]) => parts.map((p, i) => ({
  key: `${p.part}-${i}`,
  src: SOURCES[p.part],
  style: boxStyle(p),
}));

export { spriteEntries };
