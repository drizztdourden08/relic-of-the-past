/* @layer renderer-lib @kind logic */
import { sprites } from '@rotp/packs';
import { platformFiles } from '../platform-files';

const saveSpriteDebug = (data: unknown) => sprites.saveDebug(platformFiles(), data);

export { saveSpriteDebug };
