/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { PanelPlacement } from './Randomizer.type';

const RUN_PANELS = {
  files: { section: 'files', span: 1 },
} as const satisfies Record<string, PanelPlacement>;

const NOT_RANDOMIZED = msg('views-randomizer:options.notRandomized');

export { NOT_RANDOMIZED, RUN_PANELS };
