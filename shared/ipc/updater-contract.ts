/* @layer shared-types @kind types */
/**
 * Shapes shared between the updater's main-process side and the renderer. The feed
 * entry a version was built from stays in main: the renderer picks by version string.
 */

interface UpdateInfo {
  version: string;
  releaseNotes: string;
  releaseDate: string;
}

/** One row in the version picker. */
interface VersionOption {
  version: string;
  releaseNotes: string;
  releaseDate: string;
  /** Bytes of the full package. */
  size: number;
  prerelease: boolean;
  /** Older than what is running. */
  downgrade: boolean;
}

/** What this build is able to do about updates. */
interface UpdaterCapabilities {
  /** Worth asking whether a newer version exists. */
  canCheck: boolean;
  /** Able to download and apply it, rather than sending the user to the release page. */
  canInstall: boolean;
}

interface UpdaterPrefs {
  allowPrerelease: boolean;
}

export type { UpdateInfo, UpdaterCapabilities, UpdaterPrefs, VersionOption };
