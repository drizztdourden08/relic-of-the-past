/* @layer renderer-lib @kind logic */
/**
 * The bundled world package for one Archipelago version, fetched from the public folder the
 * build fills (tooling/apworld, like the wasm): builds.json names each build with its hash, the
 * build itself sits at archipelago/<version>/relic_of_the_past.apworld. Null when the app has
 * no build for that version, or when the bytes do not match the index.
 */
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
