/* @layer renderer-components @kind constants */
import type { EdgeHintSpec } from './EdgeSwipeHint.type';

const EDGE_HINTS: readonly EdgeHintSpec[] = [
  { side: 'start', icon: 'chevron-right' },
  { side: 'end', icon: 'chevron-left' },
];

export { EDGE_HINTS };
