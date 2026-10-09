/* @layer renderer-lib @kind logic */
import { roms } from '@rotp/roms';
import { platformFiles } from '../platform-files';

const getRomInfo = (romFile: string) => roms.getInfo(platformFiles(), romFile);

export { getRomInfo };
