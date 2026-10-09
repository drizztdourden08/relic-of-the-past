/* @layer renderer-app @kind constants */
import type { ConfirmActionOptions } from '@drizztdourden08/brock-react';

const SHADOW_EDITOR_WARNING_KEY = 'shadowEditor.warningDismissed';

const SHADOW_EDITOR_WARNING: ConfirmActionOptions = {
  title: 'Shadow Editor (Developer Tool)',
  message: 'This tool changes shadow casting data that is committed to the project source. Changes here affect the lighting of every build.\n\nIt is only available in development.',
  confirmLabel: 'I understand, open editor',
};

export { SHADOW_EDITOR_WARNING, SHADOW_EDITOR_WARNING_KEY };
