/* @layer renderer-lib @kind logic */
import * as sprites from '@shared/storage/sprites';
import { platformFiles } from '../platform-files';

const saveSpriteReview = (data: unknown) => sprites.saveReview(platformFiles(), data);

export { saveSpriteReview };
