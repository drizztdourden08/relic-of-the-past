/* @layer website-site @kind constants */
const STEP_LIST_TEXT = {
  label: 'What to listen for',
  jump: (time: string, label: string): string => `${time}, ${label}`,
} as const;

export { STEP_LIST_TEXT };
