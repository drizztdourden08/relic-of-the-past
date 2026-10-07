/* @layer bridge-wasm @kind logic */
/**
 * DeathLink turned on and off for the session: the core's gate bit and the room link
 * (death-link.ts) together. The profile's flag switches it on at start; the slot data the room
 * hands over on Connected has the last word (slot-death-link.ts).
 */
import { createDeathLink } from './death-link';
import type { ApBouncedPacket } from './ap-protocol.type';
import type { DeathLink, DeathLinkDeps } from './death-link';
import type { OnlineCore } from './online-core.type';

interface DeathLinkSwitchDeps extends DeathLinkDeps {
  core: Pick<OnlineCore, 'killLink' | 'onLinkDied' | 'setDeathLink'>;
}

interface DeathLinkSwitch {
  set(enabled: boolean): void;
  handleBounced(packet: ApBouncedPacket): void;
  /** Session end: the link goes, the gate bit goes with the core's own disarm. */
  dispose(): void;
}

const createDeathLinkSwitch = (deps: DeathLinkSwitchDeps): DeathLinkSwitch => {
  const { core } = deps;
  let link: DeathLink | null = null;
  const dispose = (): void => {
    link?.dispose();
    link = null;
  };
  return {
    set(enabled) {
      core.setDeathLink(enabled);
      if (enabled && link === null) link = createDeathLink(deps);
      if (!enabled) dispose();
    },
    handleBounced: (packet) => link?.handleBounced(packet),
    dispose,
  };
};

export { createDeathLinkSwitch };
export type { DeathLinkSwitch };
