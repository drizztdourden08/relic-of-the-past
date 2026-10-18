/* @layer renderer-components @kind logic */
import type { ProfileRandomizerConfig } from '@app/profiles/types';
import { buildOptionsSnapshot } from '@rotp/randomizer';
import { randomizerChoiceOverrides } from '@app/hooks/randomizer/randomizer-choices';
import { absorbPort, serverUrlOf } from '@app/hooks/randomizer/server-setup/server-setup-draft';
import { randomSeed } from './random-seed';
import type { RandomizerFormState } from './build-randomizer-config.type';

const allowedMode = (mode: RandomizerFormState['mode'], experimental: boolean): RandomizerFormState['mode'] =>
  (experimental ? mode : 'local');

const buildRandomizerConfig = (form: RandomizerFormState, experimental: boolean): ProfileRandomizerConfig | undefined => {
  if (!form.enabled) return undefined;
  const mode = allowedMode(form.mode, experimental);
  const config: ProfileRandomizerConfig = {
    mode,
    seed: form.seed.trim() || randomSeed(),
    options: buildOptionsSnapshot(randomizerChoiceOverrides(form)),
  };
  if (form.capacity.wallet.mode === 'custom') config.frozenSettings = { carryMoreRupees: true };
  if (mode === 'online') {
    const server = absorbPort(form.server);
    if (server.host.trim() !== '') config.serverUrl = serverUrlOf(server);
    if (server.slotName.trim() !== '') config.slotName = server.slotName.trim();
    if (server.password !== '') config.password = server.password;
    config.deathLink = form.deathLink;
    config.trackOtherPlayers = form.trackOtherPlayers;
  }
  return config;
};

export { buildRandomizerConfig };
