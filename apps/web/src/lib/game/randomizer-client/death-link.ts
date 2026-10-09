/* @layer bridge-wasm @kind logic */
import { log } from '../../log-bus';
import { DEATH_LINK_TAG } from './online-handshake';
import { emitOnlineNotice } from './online-notices';
import { deathLinkOnlineNotice } from './death-link-toast-text';
import type { DeathLinkNotice } from './online-notices';
import { DEATH_LINK_GUARD_MS, KILL_LOG_NOTE, MS_PER_SECOND } from './death-link.constants';
import type { DeathLink, DeathLinkDeps } from './death-link.type';

const emitDeathLinkNotice = (notice: DeathLinkNotice): void => emitOnlineNotice(deathLinkOnlineNotice(notice));

const createDeathLink = (deps: DeathLinkDeps): DeathLink => {
  const { send, slotName, core, now = Date.now, notify = emitDeathLinkNotice } = deps;
  let lastSentAt = Number.NEGATIVE_INFINITY;
  let lastKilledAt = Number.NEGATIVE_INFINITY;
  const isGuarded = (at: number): boolean => now() - at < DEATH_LINK_GUARD_MS;

  const unsubscribe = core.onLinkDied(({ byRoom, text }) => {
    if (byRoom || isGuarded(lastKilledAt)) return;
    lastSentAt = now();
    send({
      cmd: 'Bounce',
      tags: [DEATH_LINK_TAG],
      data: { time: lastSentAt / MS_PER_SECOND, source: slotName, cause: text || `${slotName} died` },
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

export { createDeathLink };
export type { DeathLink, DeathLinkDeps } from './death-link.type';
