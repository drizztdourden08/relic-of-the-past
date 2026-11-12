/* @layer website-site @kind logic */
import { INTERNAL_ASSETS } from './downloads.constants';

const isInternalAsset = (name: string): boolean => INTERNAL_ASSETS.some((pattern) => pattern.test(name));

export { isInternalAsset };
