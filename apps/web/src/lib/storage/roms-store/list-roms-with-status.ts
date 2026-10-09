/* @layer renderer-lib @kind logic */
import * as roms from '@shared/storage/roms';
import { platformFiles } from '../platform-files';

const listRomsWithStatus = () => roms.listWithStatus(platformFiles());

export { listRomsWithStatus };
