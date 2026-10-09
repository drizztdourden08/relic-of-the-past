/* @layer shared-game @kind logic */
import type { EntityKind } from '@rotp/game-data';
import type { DraftRecommendation } from '../types';
import { fnv1a } from './fnv1a';
import { identityOf } from './identity-of';

const recommendationId = <K extends EntityKind>(draft: DraftRecommendation<K>): string =>
  `rec-${draft.kind}-${draft.action}-${fnv1a(identityOf(draft))}`;

export { recommendationId };
