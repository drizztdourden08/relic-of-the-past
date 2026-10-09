/* @layer bridge-wasm @kind types */
import type { ApBouncedPacket } from './ap-protocol.type';
import type { DeathLinkDeps } from './death-link.type';
import type { OnlineCore } from './online-core.type';

interface DeathLinkSwitchDeps extends DeathLinkDeps {
  core: Pick<OnlineCore, 'killLink' | 'onLinkDied' | 'setDeathLink'>;
}

interface DeathLinkSwitch {
  set(enabled: boolean): void;
  handleBounced(packet: ApBouncedPacket): void;
  dispose(): void;
}

export type { DeathLinkSwitch, DeathLinkSwitchDeps };
