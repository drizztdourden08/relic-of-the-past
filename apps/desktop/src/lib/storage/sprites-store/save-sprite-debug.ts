/* @layer renderer-lib @kind logic */
import * as sprites from '@shared/storage/sprites';
import { platformFiles } from '../platform-files';

const saveSpriteDebug = (data: unknown) => sprites.saveDebug(platformFiles(), data);

export { saveSpriteDebug };
