/* @layer renderer-components @kind logic */
import type { LanguageSet } from '@rotp/languages';
import { mapEntry } from './map-entry';

const withEntryNote = (set: LanguageSet, id: number, note: string): LanguageSet =>
  mapEntry(set, id, (entry) => ({ ...entry, note: note.length > 0 ? note : undefined }));

export { withEntryNote };
