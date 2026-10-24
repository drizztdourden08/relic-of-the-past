/* @layer renderer-components @kind constants */
import type { ProfileRandomizerConfig } from '@app/profiles/types';

const RUN_TYPE_LABELS: Readonly<Record<ProfileRandomizerConfig['mode'], string>> = {
  local: 'Local',
  online: 'Archipelago',
  archipelia: 'Archipelia',
};

export { RUN_TYPE_LABELS };
