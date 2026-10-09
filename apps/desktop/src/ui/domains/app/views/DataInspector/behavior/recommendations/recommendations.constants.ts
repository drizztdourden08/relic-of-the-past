/* @layer renderer-app @kind data */
import type { SchemaConfig } from '@drizztdourden08/tessera/data';
import type { Confidence, Recommendation } from '@rotp/navigation';
import type { ProposalDraft } from './recommendations.type';

const NO_RECOMMENDATIONS: readonly Recommendation[] = [];

const NO_LINES: readonly number[] = [];

const CONFIDENCE_RANK: Record<Confidence, number> = { certain: 0, likely: 1 };

const RECOMMENDATION_GROUP_BY: readonly string[] = ['kind'];

const RECOMMENDATION_SCHEMA: SchemaConfig = {
  order: ['kind', 'action', 'targetId', 'reason', 'confidence', 'screenId', 'firstSeenAt'],
  labels: {
    kind: 'Collection',
    action: 'Action',
    targetId: 'Target',
    reason: 'Reason',
    confidence: 'Confidence',
    screenId: 'Screen',
    firstSeenAt: 'First seen',
  },
  hidden: ['id'],
  defaultColumns: ['kind', 'action', 'targetId', 'reason', 'confidence', 'screenId', 'firstSeenAt'],
};

const NO_DRAFT: ProposalDraft = { forId: null, record: null };

const FINDING_NO_TARGET = 'This finding names no record to change.';
const WRITE_FAILED = 'The write failed.';

export {
  CONFIDENCE_RANK, FINDING_NO_TARGET, NO_DRAFT, NO_LINES, NO_RECOMMENDATIONS, RECOMMENDATION_GROUP_BY,
  RECOMMENDATION_SCHEMA, WRITE_FAILED,
};
