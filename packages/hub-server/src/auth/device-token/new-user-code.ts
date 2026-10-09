/* @layer hub-core @kind logic */
import { randomInt } from 'node:crypto';
import { UNAMBIGUOUS_CODE_ALPHABET, USER_CODE_GROUP, USER_CODE_LENGTH } from './device-token.constants';

const newUserCode = (): string => {
  const chars = Array.from(
    { length: USER_CODE_LENGTH },
    () => UNAMBIGUOUS_CODE_ALPHABET[randomInt(UNAMBIGUOUS_CODE_ALPHABET.length)],
  );
  return `${chars.slice(0, USER_CODE_GROUP).join('')}-${chars.slice(USER_CODE_GROUP).join('')}`;
};

export { newUserCode };
