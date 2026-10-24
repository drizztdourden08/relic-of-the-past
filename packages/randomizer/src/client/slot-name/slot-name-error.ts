/* @layer bridge-wasm @kind logic */
import { FORBIDDEN_SLOT_CHARS, MAX_SLOT_NAME_LENGTH } from './slot-name.constants';

const slotNameError = (name: string): string | null => {
  if (name === '') return null;
  if (name !== name.trim()) return 'No space at the start or the end.';
  if ([...name].length > MAX_SLOT_NAME_LENGTH) return `At most ${MAX_SLOT_NAME_LENGTH} characters.`;
  if (FORBIDDEN_SLOT_CHARS.test(name)) return 'No { or } and no control characters.';
  return null;
};

export { slotNameError };
