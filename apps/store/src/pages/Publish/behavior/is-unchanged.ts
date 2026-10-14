/* @layer store-site @kind logic */
import type { UnchangedParams } from './is-unchanged.type';

const isUnchanged = (params: UnchangedParams): boolean => {
  const { mode, patch, card, banner } = params;
  return mode === 'listing' && Object.keys(patch).length === 0 && !card && !banner;
};

export { isUnchanged };
