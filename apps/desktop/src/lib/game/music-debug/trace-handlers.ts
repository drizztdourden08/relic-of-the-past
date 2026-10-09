/* @layer bridge-wasm @kind logic */
import type { MsuDebugEvent } from '../../msu/debug-bus';
import { SOUND_CHANNELS } from '../../msu/sound-claim';
import { setSoundTrace } from '@rotp/game-core';
import type { GameState } from '@rotp/game-core';
import { MUSIC_CODES } from './music-debug.constants';
import { musicDebugState } from './music-debug-state';
import type { MusicDebugEvent, MusicDebugOwner } from './music-debug.type';
import { recordMusicEvent } from './record-music-event';

const hex = (id: number): string => `0x${id.toString(16).padStart(2, '0')}`;

const onSoundTrace = (channel: number, id: number, pan: number, claimed: number): void => {
  const name = SOUND_CHANNELS[channel] ?? 'sfx1';
  const owner: MusicDebugOwner = claimed ? 'pack' : 'chip';
  const panNote = pan ? ` pan ${hex(pan)}` : '';
  recordMusicEvent({ channel: name, detail: `${hex(id)}${panNote}`, owner }, `${name}:${id}`, hex(id));
};

const onMusicTrace = (ctrl: number, module: number, external: number): void => {
  const owner: MusicDebugOwner = external ? 'pack' : 'chip';
  const label = MUSIC_CODES[ctrl] ?? `track ${ctrl}`;
  recordMusicEvent({ channel: 'music', detail: `${label} (module ${module})`, owner }, `music:${ctrl}`, label);
};

const onMsuDebug = (event: MsuDebugEvent): void => {
  const channel = event.channel as MusicDebugEvent['channel'];
  const outcome = event.passed ? 'played' : 'skipped';
  recordMusicEvent(
    { channel, detail: `roll ${event.chance}% → ${outcome} - ${event.layerName}`, owner: event.passed ? 'pack' : 'skipped' },
    `roll:${event.channel}:${event.programId}:${event.layerId}`,
    `${event.layerName} @${event.chance}%`,
  );
};

const onGameState = (state: GameState): void => {
  if (state.status === 'running' && musicDebugState.armed) setSoundTrace(true);
};

const traceHandlers = { onSoundTrace, onMusicTrace, onMsuDebug, onGameState };

export { traceHandlers };
