/* @layer renderer-app @kind logic */
import { killLinkInCore, onLinkDied } from '@rotp/randomizer';
import type { ArchipelagoGame } from '@drizztdourden08/brock-randomizer';
import { setOnlineBits } from '@app/game/gate-word-5';
import { onlineBitsFor } from './rotp-ap-online-bits';

type DeathLink = NonNullable<ArchipelagoGame<unknown, unknown>['deathLink']>;

const rotpApDeathLink: DeathLink = {
  onDied: (listener) => onLinkDied(({ byRoom, text }) => {
    if (!byRoom) listener(text);
  }),
  kill: killLinkInCore,
  setEnabled: (on) => setOnlineBits(onlineBitsFor(on)),
};

export { rotpApDeathLink };
