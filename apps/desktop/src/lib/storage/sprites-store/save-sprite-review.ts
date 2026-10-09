/* @layer renderer-lib @kind logic */
import { sprites } from '@rotp/packs';
import { platformFiles } from '../platform-files';

const saveSpriteReview = (data: unknown) => sprites.saveReview(platformFiles(), data);

export { saveSpriteReview };
