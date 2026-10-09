/* @layer renderer-lib @kind logic */
import * as saves from '@shared/storage/saves';
import { platformFiles } from '../platform-files';
import { saveBytes } from './save-bytes';

const readSram = async (p: string): Promise<ArrayBuffer | null> => saveBytes.toArrayBuffer(await saves.readSram(platformFiles(), p));

export { readSram };
