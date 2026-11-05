/* @layer renderer-app @kind logic */
import { DEATH_LINK_KEY } from '@rotp/randomizer';
import type { ArchipelagoGame } from '@drizztdourden08/brock-randomizer';
import { onlineAllowed } from '@app/game/randomizer-client/session-store/online-allowed-slot';
import { NOT_ALLOWED } from '@app/game/randomizer-client/session-store/rotp-online-factory.constants';

type Gate = Pick<NonNullable<ArchipelagoGame<unknown, unknown>>, 'allows' | 'visible' | 'patched'>;

const rotpApGate: Required<Gate> = {
  allows: () => (onlineAllowed.current ? null : NOT_ALLOWED),
  visible: (flags) => flags.has('experimental'),
  patched: (config) => (
    config.deathLink === undefined
      ? config
      : { ...config, options: { ...config.options, values: { ...config.options.values, [DEATH_LINK_KEY]: config.deathLink } } }
  ),
};

export { rotpApGate };
