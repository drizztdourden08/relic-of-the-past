/* @layer renderer-components @kind constants */
import type { UpdateAction } from './useVersionChoice.type';

const ACTION_LABELS: Record<UpdateAction, string> = {
  update: 'Update',
  reinstall: 'Reinstall',
  downgrade: 'Downgrade',
};

export { ACTION_LABELS };
