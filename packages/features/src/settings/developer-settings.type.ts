/* @layer shared-types @kind types */
interface DeveloperSettings {
  developerToolsEnabled: boolean;
  experimentalFeaturesEnabled: boolean;
  devNavigationData: boolean;
  allowDebugLogging: boolean;
  trackerEnabled: boolean;
}

export type { DeveloperSettings };
