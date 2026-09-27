/* @layer bridge-wasm @kind logic */
/**
 * DeathLink, both ways. Link dying here goes out as a `Bounce` tagged DeathLink; a DeathLink
 * `Bounced` from another player kills Link. The room bounces our own death back to us, and the
 * death a kill causes must not go out again as a new one. The core marks the second itself
 * (ap-link-died.ts), and each direction also guards the other for 5 s.
 *
 * Each death that reaches the player is also told through `notify` (the online notices,
 * online-notices.ts): one from the room, killing Link or finding him already down, and one of
 * ours sent out.
 */
import { log } from '../../log-bus';
import { DEATH_LINK_TAG } from './online-handshake';
import { emitOnlineNotice } from './online-notices';
import { deathLinkOnlineNotice } from './death-link-toast-text';
import type { ApBouncedPacket, ApClientPacket } from './ap-protocol.type';
import type { DeathLinkNotice } from './online-notices';
import type { KillOutcome } from './ap-kill-link';
import type { OnlineCore } from './online-core.type';

const DEATH_LINK_GUARD_MS = 5000;
const emitDeathLinkNotice = (notice: DeathLinkNotice): void => emitOnlineNotice(deathLinkOnlineNotice(notice));
const KILL_LOG_NOTE: Record<KillOutcome, string> = {
  armed: '',
  down: ' (already down)',
  unsupported: ' (this core cannot kill Link)',
};

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

const createDeathLink = (deps: DeathLinkDeps): DeathLink => {
  const { send, slotName, core, now = Date.now, notify = emitDeathLinkNotice } = deps;
  let lastSentAt = Number.NEGATIVE_INFINITY;
  let lastKilledAt = Number.NEGATIVE_INFINITY;
  const isGuarded = (at: number): boolean => now() - at < DEATH_LINK_GUARD_MS;

  // The core's own word decides first: a death the room's kill caused is never sent back out,
  // however long the death took to commit. The timer stays as the second guard, for a core that
  // reports no cause.
  const unsubscribe = core.onLinkDied(({ byRoom, text }) => {
    if (byRoom || isGuarded(lastKilledAt)) return;
    lastSentAt = now();
    send({
      cmd: 'Bounce',
      tags: [DEATH_LINK_TAG],
      data: { time: lastSentAt / 1000, source: slotName, cause: text || `${slotName} died` },
    });
    log.randomizer('[Online] DeathLink sent');
    notify({ kind: 'sent' });
  });

  return {
    handleBounced(packet) {
      if (!Array.isArray(packet.tags) || !packet.tags.includes(DEATH_LINK_TAG)) return;
      const { source, cause } = packet.data ?? {};
      if (source === slotName || isGuarded(lastSentAt)) return;
      lastKilledAt = now();
      const outcome = core.killLink();
      const name = typeof source === 'string' && source ? source : 'Someone';
      const why = typeof cause === 'string' ? cause : '';
      log.randomizer(`[Online] DeathLink: ${why || `${name} died`}${KILL_LOG_NOTE[outcome]}`);
      if (outcome === 'unsupported') return;
      notify({ kind: outcome === 'armed' ? 'received' : 'dropped', source: name, cause: why });
    },
    dispose: unsubscribe,
  };
};

export { createDeathLink, DEATH_LINK_GUARD_MS };
export type { DeathLink, DeathLinkDeps };
