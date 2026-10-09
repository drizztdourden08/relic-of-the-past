/* @layer renderer-lib @kind logic */
import * as roms from '@shared/storage/roms';
import { platformFiles } from '../platform-files';

const deleteRom = (romFile: string) => roms.deleteRom(platformFiles(), romFile);

export { deleteRom };
