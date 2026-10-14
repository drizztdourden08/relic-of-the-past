/* @layer renderer-lib @kind logic */
import { normalSaves } from '../save-files';
import { platformFiles } from '../platform-files';
import { saveBytes } from './save-bytes';

const loadNormalSave = async (p: string, id: string): Promise<ArrayBuffer | null> =>
  saveBytes.toArrayBuffer(await normalSaves.load(platformFiles(), p, id));

export { loadNormalSave };
