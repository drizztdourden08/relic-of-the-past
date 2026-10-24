/* @layer renderer-lib @kind types */
interface WorldPackageBuild {
  archipelagoVersion: string;
  file: string;
  sha256: string;
  size: number;
}

interface WorldPackageBuilds {
  minimumAp: string;
  maximumAp: string;
  builds: WorldPackageBuild[];
}

export type { WorldPackageBuilds };
