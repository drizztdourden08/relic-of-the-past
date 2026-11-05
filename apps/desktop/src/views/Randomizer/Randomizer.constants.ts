/* @layer renderer-components @kind constants */
import type { PanelPlacement } from './Randomizer.type';

const RUN_PANELS = {
  files: { section: 'files', span: 1 },
} as const satisfies Record<string, PanelPlacement>;

const NOT_RANDOMIZED = 'This profile is not randomized. Randomizer options are chosen when creating a profile.';

export { NOT_RANDOMIZED, RUN_PANELS };
