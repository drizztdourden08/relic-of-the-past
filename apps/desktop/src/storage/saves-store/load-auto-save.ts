/* @layer renderer-lib @kind logic */
import { autoSaves } from '../save-files';
import { platformFiles } from '../platform-files';
import { saveBytes } from './save-bytes';

const loadAutoSave = async (p: string, id: string): Promise<ArrayBuffer | null> =>
  saveBytes.toArrayBuffer(await autoSaves.load(platformFiles(), p, id));

export { loadAutoSave };
