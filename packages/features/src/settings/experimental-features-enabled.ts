/* @layer shared-types @kind logic */
import type { DeveloperSettings } from './developer-settings.type';

const experimentalFeaturesEnabled = (settings: Pick<DeveloperSettings, 'developerToolsEnabled' | 'experimentalFeaturesEnabled'>): boolean =>
  settings.developerToolsEnabled === true && settings.experimentalFeaturesEnabled === true;

export { experimentalFeaturesEnabled };
