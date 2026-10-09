/* @layer renderer-components @kind logic */
import type { DialogueEntry, LanguageSet } from '@rotp/languages';

const mapEntry = (
  set: LanguageSet,
  id: number,
  change: (entry: DialogueEntry) => DialogueEntry,
): LanguageSet => {
  let found = false;
  const dialogue = set.dialogue.map((entry) => {
    if (entry.id !== id) return entry;
    found = true;
    return change(entry);
  });
  return found ? { ...set, dialogue } : set;
};

export { mapEntry };
