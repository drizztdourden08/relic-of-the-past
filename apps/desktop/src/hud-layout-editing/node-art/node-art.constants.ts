/* @layer renderer-components @kind constants */
import type { IconName } from '@drizztdourden08/tessera/primitives';

const PLACEHOLDERS: Readonly<Record<string, IconName | undefined>> = {
  text: 'type', shape: 'heart', slot: 'square', spacer: 'arrow-left-right', repeat: 'copy', switch: 'split',
  button: 'circle-dot', countdown: 'clock', container: 'layout-list',
};

const UNKNOWN_ART: IconName = 'circle-help';
const BLANK_ART: IconName = 'circle';

export { BLANK_ART, PLACEHOLDERS, UNKNOWN_ART };
