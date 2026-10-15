/* @layer shared-storage @kind constants */
const SET_FILES = {
  meta: 'set.json',
  dialogue: 'dialogue.json',
  text: 'text.json',
  variables: 'variables.json',
  font: 'font.bin',
  fontWidth: 'font-width.bin',
  payloadDialogue: 'dialogue.txt',
  payloadMeta: 'meta.json',
} as const;

export { SET_FILES };
