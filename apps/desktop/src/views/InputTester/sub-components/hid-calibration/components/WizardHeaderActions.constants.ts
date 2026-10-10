/* @layer renderer-components @kind constants */
import type { FlashStatus } from '../hooks/flash-status.type';

const COPY_LABEL: Record<FlashStatus, string> = { idle: 'Copy JSON', ok: 'Copied', error: 'Failed' };

const SAVE_LABEL: Record<FlashStatus, string> = { idle: 'Save to Debug Folder', ok: 'Saved', error: 'Failed' };

export { COPY_LABEL, SAVE_LABEL };
