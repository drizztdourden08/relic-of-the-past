/* @layer renderer-app @kind constants */
import type { ProfileModeDef } from '@drizztdourden08/brock-react';
import { vanillaProfileMode } from './vanilla-profile-mode';
import { vanillaSafeProfileMode } from './vanilla-safe-profile-mode';

const APP_PROFILE_MODES: readonly ProfileModeDef[] = [vanillaProfileMode, vanillaSafeProfileMode];

export { APP_PROFILE_MODES };
