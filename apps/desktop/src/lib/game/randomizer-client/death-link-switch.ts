/* @layer bridge-wasm @kind logic */
import { createDeathLink } from './death-link';
import type { DeathLink } from './death-link.type';
import type { DeathLinkSwitch, DeathLinkSwitchDeps } from './death-link-switch.type';

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
export type { DeathLinkSwitch } from './death-link-switch.type';
