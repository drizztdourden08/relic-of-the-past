/* @layer renderer-lib @kind logic */
import * as saves from '@shared/storage/saves';
import { platformFiles } from '../platform-files';
import { saveBytes } from './save-bytes';

const readScreenshot = async (p: string, slot: number): Promise<string | null> =>
  saveBytes.toBase64(await saves.readScreenshot(platformFiles(), p, slot));

export { readScreenshot };
