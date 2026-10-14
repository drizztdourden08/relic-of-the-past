/* @layer renderer-components @kind logic */
import type { DialogueEntry, LanguageSet } from '@rotp/languages';

const mapEntry = (
  set: LanguageSet,
  id: number,
  change: (entry: DialogueEntry) => DialogueEntry,
): LanguageSet => {
  if (!set.dialogue.some((entry) => entry.id === id)) return set;
  return { ...set, dialogue: set.dialogue.map((entry) => (entry.id === id ? change(entry) : entry)) };
};

export { mapEntry };
