/* @layer shared-storage @kind constants */
const SET_FILES = {
  meta: 'set.json',
  dialogue: 'dialogue.json',
  text: 'text.json',
  variables: 'variables.json',
  glossary: 'glossary.json',
  names: 'names.json',
  font: 'font.bin',
  fontWidth: 'font-width.bin',
  legacyDialogue: 'dialogue.txt',
  legacyMeta: 'meta.json',
} as const;

export { SET_FILES };
