/* @layer renderer-components @kind constants */
import type { SegmentOption } from '@drizztdourden08/tessera/primitives';
import type { EntryFilter } from './DialogueTab.type';

const FILTER_OPTIONS: SegmentOption<EntryFilter>[] = [
  { value: 'all', label: 'All' },
  { value: 'warnings', label: 'Needs attention' },
  { value: 'choices', label: 'Choices' },
];

export { FILTER_OPTIONS };
