/* @layer renderer-lib @kind logic */
import { listRomInfos } from '@app/game/port';
import { platformFiles } from '../platform-files';

const listRomsWithStatus = () => listRomInfos(platformFiles());

export { listRomsWithStatus };
