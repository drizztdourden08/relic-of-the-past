/* @layer renderer-app @kind logic */
import type { Recommendation } from '@shared/game/recommendations';
import type { RecommendationRow } from '../recommendations.type';
import { stampOf } from './stamp-of';

const rowOf = (entry: Recommendation): RecommendationRow => ({
  id: entry.id,
  kind: entry.kind,
  action: entry.action,
  targetId: entry.targetId ?? null,
  reason: entry.reason,
  confidence: entry.confidence,
  screenId: entry.screenId ?? null,
  firstSeenAt: stampOf(entry.firstSeenAt),
});

export { rowOf };
