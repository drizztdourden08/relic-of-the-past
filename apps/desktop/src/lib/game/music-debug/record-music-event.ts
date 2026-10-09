/* @layer bridge-wasm @kind logic */
import { MAX_EVENTS } from './music-debug.constants';
import { musicDebugState } from './music-debug-state';
import type { MusicDebugEvent, MusicDebugOwner } from './music-debug.type';
import { notifyMusicDebug } from './notify-music-debug';

const appendEvent = (event: Omit<MusicDebugEvent, 'id' | 'at'>): void => {
  const state = musicDebugState;
  state.events = [...state.events.slice(-(MAX_EVENTS - 1)), { ...event, id: state.nextId++, at: Date.now() }];
};

const countEvent = (key: string, channel: string, label: string, owner: MusicDebugOwner): void => {
  const { counters } = musicDebugState;
  const row = counters.get(key)
    ?? { key, channel, label, raised: 0, pack: 0, chip: 0, skipped: 0, lastAt: 0 };
  row.raised += 1;
  if (owner === 'pack') row.pack += 1;
  else if (owner === 'chip') row.chip += 1;
  else row.skipped += 1;
  row.lastAt = Date.now();
  counters.set(key, row);
};

const recordMusicEvent = (event: Omit<MusicDebugEvent, 'id' | 'at'>, key: string, label: string): void => {
  appendEvent(event);
  countEvent(key, event.channel, label, event.owner);
  notifyMusicDebug();
};

export { recordMusicEvent };
