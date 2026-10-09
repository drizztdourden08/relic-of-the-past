/* @layer renderer-app @kind constants */
import type { ExclusiveInsets } from '@app/stores/exclusive-insets-store';

const NO_INSETS: ExclusiveInsets = { left: 0, right: 0, top: 0, bottom: 0 };

const DOCK_STAGE_GAP = 8;

export { DOCK_STAGE_GAP, NO_INSETS };
