/* @layer renderer-lib @kind logic */
import * as saves from '@shared/storage/saves';
import { platformFiles } from '../platform-files';
import { saveBytes } from './save-bytes';

const readState = async (p: string, slot: number): Promise<ArrayBuffer | null> =>
  saveBytes.toArrayBuffer(await saves.readState(platformFiles(), p, slot));

export { readState };
