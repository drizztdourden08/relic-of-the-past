/* @layer renderer-lib @kind logic */
import * as saves from '@shared/storage/saves';
import { platformFiles } from '../platform-files';
import { saveBytes } from './save-bytes';

const writeScreenshot = (p: string, slot: number, data: ArrayBuffer): Promise<void> =>
  saves.writeScreenshot(platformFiles(), p, slot, saveBytes.u8(data));

export { writeScreenshot };
