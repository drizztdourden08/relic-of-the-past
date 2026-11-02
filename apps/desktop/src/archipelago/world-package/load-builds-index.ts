/* @layer renderer-lib @kind logic */
import { publicAsset } from '@app/public-asset/public-asset';
import { BUILDS_INDEX_ATTEMPTS, BUILDS_INDEX_PATH, BUILDS_INDEX_RETRY_MS } from './world-package.constants';
import type { WorldPackageBuilds } from './world-package.type';

let cached: Promise<WorldPackageBuilds | null> | null = null;

const fetchOnce = async (): Promise<WorldPackageBuilds | null> => {
  try {
    const response = await fetch(publicAsset(BUILDS_INDEX_PATH));
    return response.ok ? ((await response.json()) as WorldPackageBuilds) : null;
  } catch {
    return null;
  }
};

const fetchIndex = async (attempt = 1): Promise<WorldPackageBuilds | null> => {
  const index = await fetchOnce();
  if (index !== null || attempt >= BUILDS_INDEX_ATTEMPTS) return index;
  await new Promise((resolve) => setTimeout(resolve, BUILDS_INDEX_RETRY_MS));
  return fetchIndex(attempt + 1);
};

const loadBuildsIndex = (): Promise<WorldPackageBuilds | null> => {
  cached ??= fetchIndex().then((index) => {
    if (index === null) cached = null;
    return index;
  });
  return cached;
};

export { loadBuildsIndex };
