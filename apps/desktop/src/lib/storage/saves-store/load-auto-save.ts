/* @layer renderer-lib @kind logic */
import * as saves from '@shared/storage/saves';
import { platformFiles } from '../platform-files';
import { saveBytes } from './save-bytes';

const loadAutoSave = async (p: string, id: string): Promise<ArrayBuffer | null> =>
  saveBytes.toArrayBuffer(await saves.loadAutoSave(platformFiles(), p, id));

export { loadAutoSave };
