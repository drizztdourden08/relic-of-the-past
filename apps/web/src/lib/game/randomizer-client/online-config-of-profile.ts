/* @layer bridge-wasm @kind logic */
/**
 * What an online profile's session connects with. The room sets the game up (its slot data
 * and scouts), so only the connection travels.
 */
import { normalizeServerUrl } from './server-url';
import type { OnlineSessionConfig } from './online-session-config.type';
import type { ProfileRandomizerConfig } from '@shared/types/profile';

const DEFAULT_SLOT_NAME = 'Player';

const onlineConfigOfProfile = (config: ProfileRandomizerConfig): OnlineSessionConfig => ({
  url: normalizeServerUrl(config.serverUrl ?? ''),
  slotName: config.slotName ?? DEFAULT_SLOT_NAME,
  ...(config.password ? { password: config.password } : {}),
  deathLink: config.deathLink === true,
  trackOtherPlayers: config.trackOtherPlayers !== false,
});

export { DEFAULT_SLOT_NAME, onlineConfigOfProfile };
