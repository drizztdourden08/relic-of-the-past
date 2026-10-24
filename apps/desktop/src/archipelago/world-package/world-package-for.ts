/* @layer renderer-lib @kind logic */
import { publicAsset } from '@app/public-asset/public-asset';
import { BUILDS_INDEX_PATH, buildPathOf } from './world-package.constants';
import { sha256Hex } from './sha256-hex';
import type { WorldPackageBuilds } from './world-package.type';

const fetchIndex = async (): Promise<WorldPackageBuilds | null> => {
  const response = await fetch(publicAsset(BUILDS_INDEX_PATH));
  return response.ok ? ((await response.json()) as WorldPackageBuilds) : null;
};

const worldPackageFor = async (apVersion: string): Promise<ArrayBuffer | null> => {
  const build = (await fetchIndex())?.builds.find((candidate) => candidate.archipelagoVersion === apVersion);
  if (build === undefined) return null;
  const response = await fetch(publicAsset(buildPathOf(apVersion)));
  if (!response.ok) return null;
  const bytes = await response.arrayBuffer();
  return (await sha256Hex(bytes)) === build.sha256 ? bytes : null;
};

export { worldPackageFor };
