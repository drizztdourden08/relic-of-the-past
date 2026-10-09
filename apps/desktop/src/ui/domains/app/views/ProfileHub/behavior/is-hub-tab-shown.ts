/* @layer renderer-components @kind logic */
import type { ProfileHubTabSpec, TabShownContext } from '../ProfileHub.type';

const isHubTabShown = (spec: ProfileHubTabSpec, { isMobile, isOnline }: TabShownContext): boolean =>
  (!spec.mobileOnly || isMobile) && (!spec.onlineOnly || isOnline);

export { isHubTabShown };
