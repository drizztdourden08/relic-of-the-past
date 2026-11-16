/* @layer shared-storage @kind constants */
const SET_FILES = {
  meta: 'set.json',
  dialogue: 'dialogue.json',
  text: 'text.json',
  variables: 'variables.json',
  payloadDialogue: 'dialogue.txt',
  payloadMeta: 'meta.json',
} as const;

const ROM_FONT_FILES = {
  font: 'font.bin',
  fontWidth: 'font-width.bin',
} as const;

export { ROM_FONT_FILES, SET_FILES };
