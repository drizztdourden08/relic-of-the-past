/* @layer shared-game @kind types */
import type { DraftRecommendation } from '../types';

type Identifiable = Pick<DraftRecommendation, 'kind' | 'action' | 'targetId' | 'screenId' | 'detector' | 'key'>;

export type { Identifiable };
