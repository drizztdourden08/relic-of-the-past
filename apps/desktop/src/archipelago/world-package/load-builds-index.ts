/* @layer renderer-lib @kind logic */
import { publicAsset } from '@app/public-asset/public-asset';
import { BUILDS_INDEX_PATH } from './world-package.constants';
import type { WorldPackageBuilds } from './world-package.type';

let cached: Promise<WorldPackageBuilds | null> | null = null;

const fetchIndex = async (): Promise<WorldPackageBuilds | null> => {
  try {
    const response = await fetch(publicAsset(BUILDS_INDEX_PATH));
    return response.ok ? ((await response.json()) as WorldPackageBuilds) : null;
  } catch {
    return null;
  }
};

const loadBuildsIndex = (): Promise<WorldPackageBuilds | null> => {
  cached ??= fetchIndex().then((index) => {
    if (index === null) cached = null;
    return index;
  });
  return cached;
};

export { loadBuildsIndex };
