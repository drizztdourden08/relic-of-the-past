/* @layer renderer-widgets @kind logic */
import { COUNTER_ICONS } from '../PlayerTab.constants';
import type { CounterKind } from '../PlayerTab.type';

const counterIconOf = (kind: CounterKind, hasSilverArrows: boolean): string =>
  (kind === 'arrows' && hasSilverArrows ? 'hud-silver-arrow-icon' : COUNTER_ICONS[kind]);

export { counterIconOf };
