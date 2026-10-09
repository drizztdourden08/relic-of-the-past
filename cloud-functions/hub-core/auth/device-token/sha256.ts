/* @layer hub-core @kind logic */
import { createHash } from 'node:crypto';

const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex');

export { sha256 };
