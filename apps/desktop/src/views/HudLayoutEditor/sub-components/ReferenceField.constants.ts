/* @layer renderer-components @kind constants */
import type { IconName } from '@drizztdourden08/tessera/primitives';

const CARET: Readonly<Record<'pick' | 'go', IconName>> = { pick: 'chevron-down', go: 'external-link' };

const THUMB_ICON_SIZE = 14;
const CARET_ICON_SIZE = 10;

export { CARET, CARET_ICON_SIZE, THUMB_ICON_SIZE };
