/* @layer renderer-lib @kind logic */
import * as saves from '@shared/storage/saves';
import { platformFiles } from '../platform-files';
import { saveBytes } from './save-bytes';

const writeSram = (p: string, data: ArrayBuffer): Promise<void> => saves.writeSram(platformFiles(), p, saveBytes.u8(data));

export { writeSram };
