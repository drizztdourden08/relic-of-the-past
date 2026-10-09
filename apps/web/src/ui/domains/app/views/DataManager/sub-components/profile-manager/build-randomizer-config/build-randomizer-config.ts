/* @layer renderer-components @kind logic */
import type { ProfileRandomizerConfig } from '@shared/types/profile';
import { buildOptionsSnapshot } from '@shared/randomizer/options-snapshot';
import { randomizerChoiceOverrides } from '@app/hooks/randomizer/randomizer-choices';
import { absorbPort, serverUrlOf } from '@app/hooks/randomizer/server-setup/server-setup-draft';
import { randomSeed } from './random-seed';
import type { RandomizerFormState } from './build-randomizer-config.type';

const buildRandomizerConfig = (form: RandomizerFormState): ProfileRandomizerConfig | undefined => {
  if (!form.enabled) return undefined;
  const config: ProfileRandomizerConfig = {
    mode: form.mode,
    seed: form.seed.trim() || randomSeed(),
    options: buildOptionsSnapshot(randomizerChoiceOverrides(form)),
  };
  if (form.capacity.wallet.mode === 'custom') config.frozenSettings = { carryMoreRupees: true };
  if (form.mode === 'online') {
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
