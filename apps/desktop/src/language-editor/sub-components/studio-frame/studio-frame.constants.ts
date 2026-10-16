/* @layer renderer-components @kind constants */
import type { Hint } from '@drizztdourden08/tessera/primitives';

const STUDIO_CAPTION = 'Language Studio';
const NO_SET_TITLE = 'No language set open';
const EDITOR_LABEL = 'Language editor';
const SETS_PANEL_TITLE = 'Language sets';
const PROPERTIES_PANEL_TITLE = 'Properties';

const IDLE_HINT = 'Save keeps this language set in this app. Export makes a .rlang file you can share.';

const SAVE_GROUP_LABEL = 'Save to this app';
const EXPORT_GROUP_LABEL = 'Export a file';

const SAVE_HINT: Hint = {
  label: 'Save',
  description: 'Keeps your edits in this app now. Edits also save on their own a moment after you stop typing.',
};

const EXPORT_HINT: Hint = {
  label: 'Export .rlang',
  description: 'Makes a file to share or install in another copy of the app. Your edits are saved first.',
};

export {
  EDITOR_LABEL, EXPORT_GROUP_LABEL, EXPORT_HINT, IDLE_HINT, NO_SET_TITLE, PROPERTIES_PANEL_TITLE,
  SAVE_GROUP_LABEL, SAVE_HINT, SETS_PANEL_TITLE, STUDIO_CAPTION,
};
