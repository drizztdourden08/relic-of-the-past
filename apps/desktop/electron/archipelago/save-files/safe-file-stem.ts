/* @layer electron-main @kind logic */
import { FALLBACK_SLOT_NAME, FIRST_PRINTABLE_CODE, UNSAFE_FILENAME_CHARACTERS } from './save-files.constants';

const isSafeCharacter = (character: string): boolean => (
  (character.codePointAt(0) ?? 0) >= FIRST_PRINTABLE_CODE && !UNSAFE_FILENAME_CHARACTERS.includes(character)
);

const safeFileStem = (name: string): string => (
  [...name].map((character) => (isSafeCharacter(character) ? character : '_')).join('').trim() || FALLBACK_SLOT_NAME
);

export { safeFileStem };
