/* @layer renderer-app @kind logic */
import { killLinkInCore, onLinkDied } from '@rotp/randomizer';
import type { DeathLink } from './rotp-ap-death-link.type';
import { setOnlineBits } from '@app/game/gate-word-5';
import { onlineBitsFor } from './rotp-ap-online-bits';

const rotpApDeathLink: DeathLink = {
  onDied: (listener) => onLinkDied(({ byRoom, text }) => {
    if (!byRoom) listener(text);
  }),
  kill: killLinkInCore,
  setEnabled: (on) => setOnlineBits(onlineBitsFor(on)),
};

export { rotpApDeathLink };
