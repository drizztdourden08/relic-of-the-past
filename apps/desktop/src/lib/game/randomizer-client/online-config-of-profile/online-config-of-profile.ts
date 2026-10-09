/* @layer bridge-wasm @kind logic */
import { normalizeServerUrl } from '../server-url';
import type { OnlineSessionConfig } from '../online-session-config.type';
import type { ProfileRandomizerConfig } from '@shared/types/profile';
import { DEFAULT_SLOT_NAME } from './online-config-of-profile.constants';

const onlineConfigOfProfile = (config: ProfileRandomizerConfig): OnlineSessionConfig => ({
  url: normalizeServerUrl(config.serverUrl ?? ''),
  slotName: config.slotName ?? DEFAULT_SLOT_NAME,
  ...(config.password ? { password: config.password } : {}),
  deathLink: config.deathLink === true,
  trackOtherPlayers: config.trackOtherPlayers !== false,
});

export { onlineConfigOfProfile };
