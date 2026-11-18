/* @layer renderer-components @kind constants */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { SegmentOption } from '@drizztdourden08/tessera/primitives';
import type { ReviewStatus } from './SpriteDebug.type';

const modesOf = (t: I18n['t']) => [
  { id: 'sprites', label: t('views-sprite-debug:mode.sprites') },
  { id: 'items', label: t('views-sprite-debug:mode.items') },
];

const SAVE_DELAY_MS = 300;

const REVIEW_STATUSES: readonly ReviewStatus[] = ['neutral', 'good', 'bad', 'yellow'];

const filterOptionsOf = (t: I18n['t']): SegmentOption<'all' | ReviewStatus>[] => [
  { value: 'all', label: t('views-sprite-debug:filter.all') },
  { value: 'neutral', label: t('views-sprite-debug:status.neutral') },
  { value: 'good', label: t('views-sprite-debug:status.good') },
  { value: 'yellow', label: t('views-sprite-debug:status.yellow') },
  { value: 'bad', label: t('views-sprite-debug:status.bad') },
];

const statusOptionsOf = (t: I18n['t']): SegmentOption<ReviewStatus>[] => [
  { value: 'good', icon: 'check', hint: { label: t('views-sprite-debug:status.good'), description: t('views-sprite-debug:hint.good') } },
  { value: 'yellow', icon: 'circle-dot', hint: { label: t('views-sprite-debug:status.yellow'), description: t('views-sprite-debug:hint.yellow') } },
  { value: 'neutral', icon: 'circle', hint: { label: t('views-sprite-debug:status.neutral'), description: t('views-sprite-debug:hint.neutral') } },
  { value: 'bad', icon: 'x', hint: { label: t('views-sprite-debug:status.bad'), description: t('views-sprite-debug:hint.bad') } },
];

export { filterOptionsOf, modesOf, REVIEW_STATUSES, SAVE_DELAY_MS, statusOptionsOf };
