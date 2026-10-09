/* @layer renderer-lib @kind logic */
import * as saves from '@shared/storage/saves';
import { platformFiles } from '../platform-files';
import { saveBytes } from './save-bytes';

const loadNormalScreenshot = async (p: string, id: string): Promise<string | null> =>
  saveBytes.toBase64(await saves.loadNormalScreenshot(platformFiles(), p, id));

export { loadNormalScreenshot };
