/* @layer renderer-lib @kind logic */
import { autoSaves } from '../save-files';
import { platformFiles } from '../platform-files';
import { saveBytes } from './save-bytes';

const loadAutoScreenshot = async (p: string, id: string): Promise<string | null> =>
  saveBytes.toBase64(await autoSaves.loadScreenshot(platformFiles(), p, id));

export { loadAutoScreenshot };
