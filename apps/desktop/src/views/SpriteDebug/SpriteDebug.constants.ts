/* @layer renderer-components @kind constants */
import type { SegmentOption } from '@drizztdourden08/tessera/primitives';
import type { ReviewStatus } from './SpriteDebug.type';

const MODES = [
  { id: 'sprites', label: 'Sprite Review' },
  { id: 'items', label: 'Item Association' },
];

const SAVE_DELAY_MS = 300;

const REVIEW_STATUSES: readonly ReviewStatus[] = ['neutral', 'good', 'bad', 'yellow'];

const FILTER_OPTIONS: SegmentOption<'all' | ReviewStatus>[] = [
  { value: 'all', label: 'All' },
  { value: 'neutral', label: 'Unchecked' },
  { value: 'good', label: 'Good' },
  { value: 'yellow', label: 'Re-review' },
  { value: 'bad', label: 'Bad' },
];

const STATUS_OPTIONS: SegmentOption<ReviewStatus>[] = [
  { value: 'good', icon: 'check', hint: { label: 'Good', description: 'The sprite is right' } },
  { value: 'yellow', icon: 'circle-dot', hint: { label: 'Re-review', description: 'Look at this one again' } },
  { value: 'neutral', icon: 'circle', hint: { label: 'Unchecked', description: 'Not reviewed yet' } },
  { value: 'bad', icon: 'x', hint: { label: 'Bad', description: 'The sprite is wrong' } },
];

export { FILTER_OPTIONS, MODES, REVIEW_STATUSES, SAVE_DELAY_MS, STATUS_OPTIONS };
