/* @layer shared-store @kind logic */
import { PREFIX } from './keys.constants';

const isPackKey = (key: string): boolean => key.startsWith(PREFIX.packs) && !key.includes('..');

export { isPackKey };
