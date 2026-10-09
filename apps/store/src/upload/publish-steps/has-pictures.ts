/* @layer store-site @kind logic */
import type { PublishTarget } from '../publish-target.type';

const hasPictures = (target: PublishTarget) => target.card !== null || target.banner !== null;

export { hasPictures };
