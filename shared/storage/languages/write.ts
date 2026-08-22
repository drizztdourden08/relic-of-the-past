/* @layer shared-storage @kind logic */
/**
 * Persisting a language set. `saveSet` is a whole-set overwrite of the four
 * JSON payloads and never touches the font binaries (those are written once by
 * an extraction or copied by a create/duplicate) — and never bumps `version`,
 * which is the caller's call.
 */
import type { FileStore } from '@shared/platform';
import type { LanguageSet, LanguageSetMeta } from '@shared/game/language';
import { writeJson } from '../json';
import { dialoguePath, fontPath, fontWidthPath, glossaryPath, namesPath, setDir, setMetaPath } from './paths';
import type { SetFontBytes } from './types';

// `author` stays undefined when unset; JSON.stringify drops it from the file.
const metaOf = ({ id, name, base, origin, version, author }: LanguageSet): LanguageSetMeta => ({
  id, name, base, origin, version, author,
});

const saveSet = async (files: FileStore, set: LanguageSet): Promise<void> => {
  await writeJson(files, setMetaPath(set.id), metaOf(set));
  await writeJson(files, dialoguePath(set.id), set.dialogue);
  await writeJson(files, glossaryPath(set.id), set.glossary);
  await writeJson(files, namesPath(set.id), set.names);
};

const writeSetFont = async (files: FileStore, id: string, font: SetFontBytes): Promise<void> => {
  await files.writeBytes(fontPath(id), font.fontData);
  await files.writeBytes(fontWidthPath(id), font.fontWidth);
};

const remove = (files: FileStore, id: string): Promise<void> => files.remove(setDir(id));

export { remove, saveSet, writeSetFont };
