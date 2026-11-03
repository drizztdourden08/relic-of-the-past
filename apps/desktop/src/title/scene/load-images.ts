/* @layer renderer-hud @kind logic */
import { loadImage } from './load-image';

const loadImages = (srcs: readonly string[]): Promise<HTMLImageElement[]> => Promise.all(srcs.map(loadImage));

export { loadImages };
