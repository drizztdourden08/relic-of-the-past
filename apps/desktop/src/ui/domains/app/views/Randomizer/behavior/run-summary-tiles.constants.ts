/* @layer renderer-components @kind constants */
import type { SessionSource } from '@app/lib/game/randomizer-client';

const SOURCE_LABEL: Readonly<Record<SessionSource, string>> = {
  profile: 'started by this profile',
  manual: 'started manually',
};

export { SOURCE_LABEL };
