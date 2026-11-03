/* @layer shared-game @kind constants */
const TRUE_WORDS: ReadonlySet<string> = new Set(['true', 'yes', 'on', '1']);

const FALSE_WORDS: ReadonlySet<string> = new Set(['false', 'no', 'off', '0']);

export { FALSE_WORDS, TRUE_WORDS };
