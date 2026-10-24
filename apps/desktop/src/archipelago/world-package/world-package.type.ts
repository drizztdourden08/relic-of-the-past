/* @layer renderer-lib @kind types */
interface WorldPackageBuild {
  archipelagoVersion: string;
  file: string;
  sha256: string;
  size: number;
}

/** The part of builds.json the app reads; the release index carries more. */
interface WorldPackageBuilds {
  minimumAp: string;
  maximumAp: string;
  builds: WorldPackageBuild[];
}

export type { WorldPackageBuilds };
