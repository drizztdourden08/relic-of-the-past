/* @layer bridge-wasm @kind logic */
/**
 * Round-trip time to the room. While connected, a Bounce tagged `rotp-ping` goes out every
 * PING_INTERVAL_MS addressed to this slot only, and the server echoes it back as a Bounced.
 * The time is taken from this client's own record of when each id left, never from the echo.
 */
import type { ApBouncedPacket, ApClientPacket } from './ap-protocol.type';

const PING_TAG = 'rotp-ping';
const PING_INTERVAL_MS = 5000;
/** How many round trips the mean covers. */
const PING_WINDOW = 10;
/** An echo later than this is dropped: the connection it measured is long gone. */
const PING_EXPIRY_MS = 30000;

interface PingDeps {
  send(packet: ApClientPacket): void;
  onSample(): void;
  now?: () => number;
}

interface Pinger {
  readonly lastMs: number | null;
  readonly meanMs: number | null;
  readonly samples: number;
  start(slot: number): void;
  stop(): void;
  /** True when the packet was one of this client's pings. */
  handleBounced(packet: ApBouncedPacket): boolean;
}

const isPing = (packet: ApBouncedPacket): boolean => Array.isArray(packet.tags) && packet.tags.includes(PING_TAG);

const createPinger = (deps: PingDeps): Pinger => {
  const { send, onSample, now = Date.now } = deps;
  const pending = new Map<number, number>();
  const window: number[] = [];
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
    get lastMs() { return window.length > 0 ? window[window.length - 1] : null; },
    get meanMs() {
      return window.length > 0 ? Math.round(window.reduce((sum, ms) => sum + ms, 0) / window.length) : null;
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
      window.push(now() - sentAt);
      if (window.length > PING_WINDOW) window.shift();
      samples += 1;
      onSample();
      return true;
    },
  };
};

export { createPinger, PING_INTERVAL_MS, PING_TAG, PING_WINDOW };
export type { Pinger };
