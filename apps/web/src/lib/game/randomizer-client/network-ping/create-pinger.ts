/* @layer bridge-wasm @kind logic */
import type { ApBouncedPacket } from '../ap-protocol.type';
import { PING_EXPIRY_MS, PING_INTERVAL_MS, PING_TAG, PING_WINDOW } from './network-ping.constants';
import type { PingDeps, Pinger } from './network-ping.type';

const isPing = (packet: ApBouncedPacket): boolean => Array.isArray(packet.tags) && packet.tags.includes(PING_TAG);

const createPinger = (deps: PingDeps): Pinger => {
  const { send, onSample, now = Date.now } = deps;
  const pending = new Map<number, number>();
  const roundTrips: number[] = [];
  let nextId = 0;
  let samples = 0;
  let timer: ReturnType<typeof setInterval> | null = null;

  const ping = (slot: number): void => {
    const at = now();
    for (const [id, sentAt] of pending) if (at - sentAt > PING_EXPIRY_MS) pending.delete(id);
    const id = nextId++;
    pending.set(id, at);
    send({ cmd: 'Bounce', tags: [PING_TAG], slots: [slot], data: { t: at, id } });
  };

  const stop = (): void => {
    if (timer !== null) clearInterval(timer);
    timer = null;
    pending.clear();
  };

  return {
    get lastMs() { return roundTrips.length > 0 ? roundTrips[roundTrips.length - 1] : null; },
    get meanMs() {
      return roundTrips.length > 0 ? Math.round(roundTrips.reduce((sum, ms) => sum + ms, 0) / roundTrips.length) : null;
    },
    get samples() { return samples; },
    start(slot) {
      stop();
      ping(slot);
      timer = setInterval(() => ping(slot), PING_INTERVAL_MS);
    },
    stop,
    handleBounced(packet) {
      if (!isPing(packet)) return false;
      const id = packet.data?.id;
      const sentAt = typeof id === 'number' ? pending.get(id) : undefined;
      if (sentAt === undefined) return true;
      pending.delete(id as number);
      roundTrips.push(now() - sentAt);
      if (roundTrips.length > PING_WINDOW) roundTrips.shift();
      samples += 1;
      onSample();
      return true;
    },
  };
};

export { createPinger };
