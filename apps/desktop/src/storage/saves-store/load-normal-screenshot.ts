/* @layer renderer-lib @kind logic */
import { normalSaves } from '../save-files';
import { platformFiles } from '../platform-files';
import { saveBytes } from './save-bytes';

const loadNormalScreenshot = async (p: string, id: string): Promise<string | null> =>
  saveBytes.toBase64(await normalSaves.loadScreenshot(platformFiles(), p, id));

export { loadNormalScreenshot };
