/* @layer shared-storage @kind logic */
/**
 * Persisting a language set. `saveSet` is a whole-set overwrite of the JSON
 * payloads and never touches the font binaries (those are written once by an
 * extraction or copied by a create/duplicate). It never bumps `version` either,
 * which is the caller's call.
 *
 * Everything but the dialogue and the non-dialogue overrides is the current set
 * format's business, so the header and the variable list are written by
 * ./format-2. A set read as the older format is therefore rewritten in the
 * current one here, on the first save, without the caller doing anything.
 *
 * The overrides file stays outside that bookkeeping on purpose: it is purely
 * additive, so it needs no format to discriminate it and its absence is a
 * meaningful, valid state.
 */
import type { FileStore } from '@shared/platform';
import type { LanguageSet } from '@shared/game/language';
import { writeJson } from '../json';
import { writeContent } from './format-2';
import { dialoguePath, fontPath, fontWidthPath, setDir, textPath } from './paths';
import type { SetFontBytes } from './types';

const saveSet = async (files: FileStore, set: LanguageSet): Promise<void> => {
  await writeContent(files, set);
  await writeJson(files, dialoguePath(set.id), set.dialogue);
  await writeJson(files, textPath(set.id), set.text ?? {});
};

const writeSetFont = async (files: FileStore, id: string, font: SetFontBytes): Promise<void> => {
  await files.writeBytes(fontPath(id), font.fontData);
  await files.writeBytes(fontWidthPath(id), font.fontWidth);
};

const remove = (files: FileStore, id: string): Promise<void> => files.remove(setDir(id));

export { remove, saveSet, writeSetFont };
