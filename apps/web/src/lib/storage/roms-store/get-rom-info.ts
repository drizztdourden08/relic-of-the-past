/* @layer renderer-lib @kind logic */
import * as roms from '@shared/storage/roms';
import { platformFiles } from '../platform-files';

const getRomInfo = (romFile: string) => roms.getInfo(platformFiles(), romFile);

export { getRomInfo };
