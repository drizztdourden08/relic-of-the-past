/* @layer renderer-lib @kind logic */
import { deleteRomFile } from '../rom-files';
import { platformFiles } from '../platform-files';

const deleteRom = (romFile: string): Promise<void> => deleteRomFile(platformFiles(), romFile);

export { deleteRom };
