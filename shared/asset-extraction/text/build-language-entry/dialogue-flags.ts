/* @layer shared-asset-extraction @kind logic */
import { usesNewFormat } from '../data/language-data';
import { NEW_FORMAT_FLAG, NOT_US_ROM_FLAG } from './build-language-entry.constants';

const dialogueFlags = (code: string, index: number): number =>
  (usesNewFormat(code) ? NEW_FORMAT_FLAG : 0) | (index > 0 ? NOT_US_ROM_FLAG : 0);

export { dialogueFlags };
