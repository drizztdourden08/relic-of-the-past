/* @layer bridge-wasm @kind types */
import type { ApBouncedPacket, ApClientPacket } from './ap-protocol.type';
import type { DeathLinkNotice } from './online-notices';
import type { OnlineCore } from './online-core.type';

interface DeathLinkDeps {
  send: (packet: ApClientPacket) => void;
  slotName: string;
  core: Pick<OnlineCore, 'killLink' | 'onLinkDied'>;
  now?: () => number;
  notify?: (notice: DeathLinkNotice) => void;
}

interface DeathLink {
  handleBounced(packet: ApBouncedPacket): void;
  dispose(): void;
}

export type { DeathLink, DeathLinkDeps };
