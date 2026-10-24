/* @layer renderer-lib @kind logic */
import { publicAsset } from '@app/public-asset/public-asset';
import { buildPathOf } from './world-package.constants';
import { loadBuildsIndex } from './load-builds-index';
import { sha256Hex } from './sha256-hex';

const worldPackageFor = async (apVersion: string): Promise<ArrayBuffer | null> => {
  const build = (await loadBuildsIndex())?.builds.find((candidate) => candidate.archipelagoVersion === apVersion);
  if (build === undefined) return null;
  const response = await fetch(publicAsset(buildPathOf(apVersion)));
  if (!response.ok) return null;
  const bytes = await response.arrayBuffer();
  return (await sha256Hex(bytes)) === build.sha256 ? bytes : null;
};

export { worldPackageFor };
