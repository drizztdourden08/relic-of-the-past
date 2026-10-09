/* @layer renderer-lib @kind logic */
import * as saves from '@shared/storage/saves';
import { platformFiles } from '../platform-files';
import { saveBytes } from './save-bytes';

const loadAutoScreenshot = async (p: string, id: string): Promise<string | null> =>
  saveBytes.toBase64(await saves.loadAutoScreenshot(platformFiles(), p, id));

export { loadAutoScreenshot };
