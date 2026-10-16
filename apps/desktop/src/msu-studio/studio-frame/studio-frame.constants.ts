/* @layer renderer-components @kind constants */
const STUDIO_LABEL = 'MSU Studio';
const NO_PACK_MESSAGE = 'Select a music pack to edit its slots, layers and sounds';

const DETAILS_PANEL = { title: 'Details', storageKey: 'msu-studio.details', width: 400, minWidth: 288, maxWidth: 640 };

const EDITOR_LABELS = {
  music: 'Music slots',
  ambient: 'Ambient sounds',
  effects: 'Effects',
  files: 'Files',
} as const;

export { DETAILS_PANEL, EDITOR_LABELS, NO_PACK_MESSAGE, STUDIO_LABEL };
