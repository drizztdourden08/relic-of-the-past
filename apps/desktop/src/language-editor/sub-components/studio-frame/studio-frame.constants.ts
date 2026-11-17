/* @layer renderer-components @kind constants */
const STUDIO_LABEL = 'Language Studio';
const EDITOR_LABEL = 'Language editor';

const PROPERTIES_PANEL = { title: 'Properties', storageKey: 'language-studio.properties', width: 304, minWidth: 240, maxWidth: 480 };

const NO_SET_MESSAGE = 'Select a language set to edit';
const UNREADABLE_SET = 'That language set could not be read';

const SOURCE_LABELS = {
  rom: (base: string) => `From a ${base} ROM`,
  patch: (base: string) => `Imported from a patched ${base} ROM`,
  custom: (base: string) => `Based on ${base}`,
};

export { SOURCE_LABELS, EDITOR_LABEL, NO_SET_MESSAGE, PROPERTIES_PANEL, STUDIO_LABEL, UNREADABLE_SET };
