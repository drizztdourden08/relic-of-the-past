/* @layer hub-core @kind logic */
import { randomBytes } from 'node:crypto';

const randomToken = (): string => randomBytes(32).toString('base64url');

export { randomToken };
