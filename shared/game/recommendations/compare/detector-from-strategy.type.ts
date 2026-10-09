/* @layer shared-game @kind types */
import type { EntityKind } from '../../data/types';
import type { DetectionContext } from '../detection-types';
import type { DraftRecommendation } from '../types';
import type { SetDifference } from './difference.type';

type UnresolvableMapper<K extends EntityKind> =
  (difference: Extract<SetDifference<K>, { status: 'unresolvable' }>, context: DetectionContext) => DraftRecommendation | null;

export type { UnresolvableMapper };
