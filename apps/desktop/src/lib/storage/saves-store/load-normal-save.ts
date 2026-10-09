/* @layer renderer-lib @kind logic */
import * as saves from '@shared/storage/saves';
import { platformFiles } from '../platform-files';
import { saveBytes } from './save-bytes';

const loadNormalSave = async (p: string, id: string): Promise<ArrayBuffer | null> =>
  saveBytes.toArrayBuffer(await saves.loadNormalSave(platformFiles(), p, id));

export { loadNormalSave };
