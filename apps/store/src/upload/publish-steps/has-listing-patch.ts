/* @layer store-site @kind logic */
import type { PublishTarget } from '../publish-target.type';

const hasListingPatch = (target: PublishTarget) => Object.keys(target.patch).length > 0;

export { hasListingPatch };
