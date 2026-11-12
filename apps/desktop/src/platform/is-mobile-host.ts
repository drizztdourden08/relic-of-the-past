/* @layer renderer-other @kind logic */
import { getPlatform } from '@drizztdourden08/brock-react';
import { startupFlag } from '@app/launch-flags/startup-flag';

const previewsMobile = (): boolean => {
  try {
    return startupFlag('form-factor') === 'mobile';
  } catch {
    return false;
  }
};

const isMobileHost = (): boolean => {
  const { formFactor, host } = getPlatform().info;
  return formFactor === 'mobile' || (host === 'electron' && previewsMobile());
};

export { isMobileHost };
