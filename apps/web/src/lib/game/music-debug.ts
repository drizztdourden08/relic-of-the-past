/* @layer bridge-wasm @kind logic */
/**
 * The music debugger's data: every sound event in one ordered feed, with running counts.
 *
 * Three sources land here. The core's sound trace reports every id the game raises, claimed or
 * not, so the feed shows what the chip is playing next to what the pack replaced. The core's
 * music trace does the same for the music-control port, fades included, even when no pack owns
 * music. The engine's debug bus adds the one thing neither can see: chance rolls, where a layer
 * decided not to sound at all.
 *
 * The core-side gate costs host-calls while armed, so it is armed only while a debugger is
 * actually watching (`setMusicDebugArmed`); the engine's bus is free and always on.
 */
import { SOUND_CHANNELS } from '../msu/sound-claim';
import { subscribeMsuDebug } from '../msu/debug-bus';
import { setSoundTrace } from './bridge/host-gates';
import { subscribeGameState } from './wasm-bridge';

/** Who produced (or suppressed) the sound: the pack's engine, the sound chip, or a lost roll. */
type MusicDebugOwner = 'pack' | 'chip' | 'skipped';

interface MusicDebugEvent {
  id: number;
  /** Wall-clock ms, for the feed's timestamps. */
  at: number;
  channel: 'music' | 'ambient' | 'sfx1' | 'sfx2';
  /** One human-readable line: what was raised or decided. */
  detail: string;
  owner: MusicDebugOwner;
}

interface MusicDebugCounter {
  key: string;
  channel: string;
  label: string;
  raised: number;
  pack: number;
  chip: number;
  skipped: number;
  lastAt: number;
}

const MAX_EVENTS = 120;

/** The game's fade bytes, named the way the disassembly names them. */
const MUSIC_CODES: Record<number, string> = {
  0xf0: 'pause', 0xf1: 'fade out', 0xf2: 'duck', 0xf3: 'full volume',
};

let nextId = 0;
let events: MusicDebugEvent[] = [];
const counters = new Map<string, MusicDebugCounter>();
const listeners = new Set<() => void>();

const notify = (): void => { listeners.forEach((listener) => listener()); };

const push = (event: Omit<MusicDebugEvent, 'id' | 'at'>): void => {
  events = [...events.slice(-(MAX_EVENTS - 1)), { ...event, id: nextId++, at: Date.now() }];
};

const count = (key: string, channel: string, label: string, owner: MusicDebugOwner): void => {
  const row = counters.get(key)
    ?? { key, channel, label, raised: 0, pack: 0, chip: 0, skipped: 0, lastAt: 0 };
  row.raised += 1;
  if (owner === 'pack') row.pack += 1;
  else if (owner === 'chip') row.chip += 1;
  else row.skipped += 1;
  row.lastAt = Date.now();
  counters.set(key, row);
};

const hex = (id: number): string => `0x${id.toString(16).padStart(2, '0')}`;

declare global {
  interface Window {
    /** The core's sound trace: every raise on the three sound ports, with its claim verdict. */
    __onSoundTrace?: (channel: number, id: number, pan: number, claimed: number) => void;
    /** The core's music trace: every accepted music-control write, and who owns music. */
    __onMusicTrace?: (ctrl: number, module: number, external: number) => void;
  }
}

window.__onSoundTrace = (channel, id, pan, claimed) => {
  const name = SOUND_CHANNELS[channel] ?? 'sfx1';
  const owner: MusicDebugOwner = claimed ? 'pack' : 'chip';
  const panNote = pan ? ` pan ${hex(pan)}` : '';
  push({ channel: name, detail: `${hex(id)}${panNote}`, owner });
  count(`${name}:${id}`, name, hex(id), owner);
  notify();
};

window.__onMusicTrace = (ctrl, module, external) => {
  const owner: MusicDebugOwner = external ? 'pack' : 'chip';
  const label = MUSIC_CODES[ctrl] ?? `track ${ctrl}`;
  push({ channel: 'music', detail: `${label} (module ${module})`, owner });
  count(`music:${ctrl}`, 'music', label, owner);
  notify();
};

subscribeMsuDebug((event) => {
  const channel = event.channel as MusicDebugEvent['channel'];
  const outcome = event.passed ? 'played' : 'skipped';
  push({
    channel,
    detail: `roll ${event.chance}% → ${outcome} - ${event.layerName}`,
    owner: event.passed ? 'pack' : 'skipped',
  });
  count(`roll:${event.channel}:${event.programId}:${event.layerId}`, channel,
    `${event.layerName} @${event.chance}%`, event.passed ? 'pack' : 'skipped');
  notify();
});

/**
 * Whether a debugger wants the traces on. Kept here instead of trusting the gate mirror: every
 * game boot starts from a cleared gate word (resetGame wipes the mirror, then the core comes up
 * with nothing set), so an arming made before or across a boot has to be applied AGAIN once the
 * new core is running. The subscription below does that for as long as a debugger is armed.
 */
let armed = false;

subscribeGameState((state) => {
  if (state.status === 'running' && armed) setSoundTrace(true);
});

/** Arm or disarm the core-side traces. The feed keeps whatever it has already collected. */
const setMusicDebugArmed = (on: boolean): void => {
  armed = on;
  setSoundTrace(on);
};

const clearMusicDebug = (): void => {
  events = [];
  counters.clear();
  notify();
};

const subscribeMusicDebug = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

/** Stable between notifications, so useSyncExternalStore sees one snapshot per change. */
const getMusicDebugEvents = (): MusicDebugEvent[] => events;

let countersSnapshot: MusicDebugCounter[] = [];
let countersDirtyAt = -1;
const getMusicDebugCounters = (): MusicDebugCounter[] => {
  if (countersDirtyAt !== nextId) {
    countersDirtyAt = nextId;
    countersSnapshot = [...counters.values()].sort((a, b) => b.lastAt - a.lastAt);
  }
  return countersSnapshot;
};

export {
  setMusicDebugArmed, clearMusicDebug, subscribeMusicDebug,
  getMusicDebugEvents, getMusicDebugCounters,
};
export type { MusicDebugEvent, MusicDebugCounter, MusicDebugOwner };
