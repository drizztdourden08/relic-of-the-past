/* @layer renderer-lib @kind logic */
import * as saves from '@shared/storage/saves';
import { platformFiles } from '../platform-files';
import { saveBytes } from './save-bytes';

const writeState = async (p: string, slot: number, data: ArrayBuffer): Promise<void> =>
  saves.writeState(platformFiles(), p, slot, await saveBytes.stamped(data));

export { writeState };
