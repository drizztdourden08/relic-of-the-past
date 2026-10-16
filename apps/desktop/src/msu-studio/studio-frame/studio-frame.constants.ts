/* @layer renderer-components @kind constants */
import type { Hint } from '@drizztdourden08/tessera/primitives';

const STUDIO_CAPTION = 'MSU Studio';
const NO_PACK_TITLE = 'No music pack open';
const EDITOR_LABEL = 'Music editor';
const PACKS_PANEL_TITLE = 'Music packs';
const PROPERTIES_PANEL_TITLE = 'Pack properties';
const NO_PACK_MESSAGE = 'Select a music pack to edit its slots, layers and sounds';

const IDLE_HINT = 'Changes to a pack are kept in this app as you make them, so there is no save step. Export makes a file to share.';

const EXPORT_GROUP_LABEL = 'Export a file';

const EXPORT_MSUL_HINT: Hint = {
  label: 'Export .msul',
  description: 'Makes one file with every layer kept. Install it in another copy of this app.',
};

const EXPORT_MSU1_HINT: Hint = {
  label: 'Export MSU-1',
  description: 'Makes a zip with the layers flattened, for MSU-1 players.',
};

export {
  EDITOR_LABEL, EXPORT_GROUP_LABEL, EXPORT_MSU1_HINT, EXPORT_MSUL_HINT, IDLE_HINT, NO_PACK_MESSAGE,
  NO_PACK_TITLE, PACKS_PANEL_TITLE, PROPERTIES_PANEL_TITLE, STUDIO_CAPTION,
};
