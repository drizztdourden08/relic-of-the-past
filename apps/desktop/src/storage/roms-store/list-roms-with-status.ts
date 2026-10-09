/* @layer renderer-lib @kind logic */
import { roms } from '@rotp/roms';
import { platformFiles } from '../platform-files';

const listRomsWithStatus = () => roms.listWithStatus(platformFiles());

export { listRomsWithStatus };
