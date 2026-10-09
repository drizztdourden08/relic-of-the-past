/* @layer bridge-wasm @kind logic */
import { normalizeServerUrl, DEFAULT_SLOT_NAME } from '@rotp/randomizer';
import type { OnlineSessionConfig } from '@rotp/randomizer';
import type { ProfileRandomizerConfig } from '@app/profiles/types';

const onlineConfigOfProfile = (config: ProfileRandomizerConfig): OnlineSessionConfig => ({
  url: normalizeServerUrl(config.serverUrl ?? ''),
  slotName: config.slotName ?? DEFAULT_SLOT_NAME,
  ...(config.password ? { password: config.password } : {}),
  deathLink: config.deathLink === true,
  trackOtherPlayers: config.trackOtherPlayers !== false,
});

export { onlineConfigOfProfile };
