/* @layer root-config @kind logic */
/** The app's Bearer token: 32 random bytes, shown once, kept only as a sha256.
 *  The same hash serves the poll secret and the user code lookup. */
import { createHash, randomBytes, randomInt } from 'node:crypto';

/** Letters and digits that are hard to confuse when read off a screen. */
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const newDeviceToken = (): string => randomBytes(32).toString('base64url');

const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex');

/** An 8-character user code shown as XXXX-XXXX, the shape deviceConfirmSchema accepts. */
const newUserCode = (): string => {
  const chars = Array.from({ length: 8 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]);
  return `${chars.slice(0, 4).join('')}-${chars.slice(4).join('')}`;
};

export { newDeviceToken, sha256, newUserCode };
