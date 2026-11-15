/* @layer renderer-components @kind logic */
import { serializeTokens } from '@rotp/languages';
import type { LanguageSet } from '@rotp/languages';

const setStrings = (set: LanguageSet): string[] => [
  ...set.dialogue.map((entry) => serializeTokens(entry.tokens)),
  ...set.glossary.map((term) => term.value),
  ...Object.values<string>(set.names.items),
  ...Object.values<string>(set.names.bottles),
  ...Object.values<string>(set.names.labels),
  ...Object.values(set.text ?? {}).flatMap((slots) => Object.values<string>(slots)),
];

export { setStrings };
