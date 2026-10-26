/* @layer bridge-wasm @kind logic */
import type { WorldPackageBuild } from '@app/archipelago/world-package';

const pickBuild = (builds: readonly WorldPackageBuild[], ap: string): WorldPackageBuild | null =>
  builds.find((build) => build.archipelagoVersion === ap) ?? null;

export { pickBuild };
