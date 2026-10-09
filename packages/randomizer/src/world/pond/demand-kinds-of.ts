/* @layer shared-game @kind logic */
import type { PondAskSetting } from './pond-ask.type';
import type { DemandKind } from './pond.type';

const demandKindsOf = (ask: PondAskSetting, candidates: readonly string[]): readonly DemandKind[] => [
  ...(['rupees', 'bombs', 'arrows'] as const).filter((currency) => ask[currency].enabled),
  ...(ask.bottle.enabled && ask.bottle.contents.length > 0 ? ['bottle' as const] : []),
  ...(ask.item.enabled && candidates.length > 0 ? ['item' as const] : []),
];

export { demandKindsOf };
