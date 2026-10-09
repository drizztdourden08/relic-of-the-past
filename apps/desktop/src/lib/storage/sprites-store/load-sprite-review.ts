/* @layer renderer-lib @kind logic */
import { sprites } from '@rotp/packs';
import { platformFiles } from '../platform-files';

const loadSpriteReview = () => sprites.loadReview(platformFiles());

export { loadSpriteReview };
