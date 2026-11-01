/* @layer website-site @kind logic */
import type { ReleaseAsset } from '../github';
import type { Platform } from '../platform';
import { PLATFORM_MATCHERS } from './downloads.constants';
import { isInternalAsset } from './is-internal-asset';

const pickAssets = (assets: ReleaseAsset[], platform: Platform): ReleaseAsset[] => {
  const people = assets.filter((asset) => !isInternalAsset(asset.name));
  const picked: ReleaseAsset[] = [];
  for (const matcher of PLATFORM_MATCHERS[platform]) {
    for (const asset of people) {
      if (matcher.test(asset.name) && !picked.includes(asset)) picked.push(asset);
    }
  }
  return picked;
};

export { pickAssets };
