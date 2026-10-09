/* @layer renderer-lib @kind logic */
import { roms } from '@rotp/roms';
import { platformFiles } from '../platform-files';

const deleteRom = (romFile: string) => roms.deleteRom(platformFiles(), romFile);

export { deleteRom };
