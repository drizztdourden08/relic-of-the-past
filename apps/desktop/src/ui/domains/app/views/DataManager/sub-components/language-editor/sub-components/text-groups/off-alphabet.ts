/* @layer renderer-components @kind logic */
import { CAPS_ALPHABET } from './text-groups.constants';
import type { TextSlot } from '@shared/game/language';

const offAlphabet = (slot: TextSlot, value: string): boolean =>
  slot.alphabet === 'latin-caps' && value.length > 0 && !CAPS_ALPHABET.test(value);

export { offAlphabet };
