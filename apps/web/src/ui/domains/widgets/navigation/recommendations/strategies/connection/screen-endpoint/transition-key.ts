/* @layer renderer-widgets @kind logic */
import type { ObservedTransition } from '@shared/game/recommendations';
import { resolveRealDestId } from '../../../../connection-audit-resolve';

const transitionKey = (item: ObservedTransition): string =>
  resolveRealDestId(item.kind, item.index) ?? `unresolved:${item.kind}:${item.index}`;

export { transitionKey };
