/**
 * Master volume control via Web Audio GainNode.
 * Inserts a gain node between SDL2's ScriptProcessorNode and the AudioContext destination.
 */

import { getModule } from './wasm-bridge';

let gainNode: GainNode | null = null;
let pendingVolume: number | null = null;
let pendingPollId: ReturnType<typeof setInterval> | null = null;

const getSDL2Audio = (): { audioContext: AudioContext; scriptProcessorNode: AudioNode } | null => {
  const mod = getModule();
  const sdl2 = (mod as any)?.SDL2 as
    | { audioContext?: AudioContext; audio?: { scriptProcessorNode?: AudioNode } }
    | undefined;
  if (!sdl2?.audioContext || !sdl2?.audio?.scriptProcessorNode) return null;
  return { audioContext: sdl2.audioContext, scriptProcessorNode: sdl2.audio.scriptProcessorNode };
};

const clearPendingPoll = (): void => {
  if (pendingPollId !== null) {
    clearInterval(pendingPollId);
    pendingPollId = null;
  }
};

const startPendingPoll = (): void => {
  clearPendingPoll();
  pendingPollId = setInterval(() => {
    if (pendingVolume === null) {
      clearPendingPoll();
      return;
    }
    const sdl2 = getSDL2Audio();
    if (sdl2) {
      const vol = pendingVolume;
      pendingVolume = null;
      clearPendingPoll();
      initMasterVolume(vol);
    }
  }, 50);
};

const initMasterVolume = (volume: number): void => {
  const sdl2 = getSDL2Audio();
  if (!sdl2) {
    pendingVolume = volume;
    startPendingPoll();
    return;
  }

  const { audioContext: ctx, scriptProcessorNode: source } = sdl2;

  // Already hooked
  if (gainNode) {
    gainNode.gain.value = volume / 100;
    return;
  }

  // Create gain node and rewire: source → gain → destination
  gainNode = ctx.createGain();
  gainNode.gain.value = volume / 100;
  source.disconnect();
  source.connect(gainNode);
  gainNode.connect(ctx.destination);
};

const setMasterVolume = (volume: number): void => {
  if (gainNode) {
    gainNode.gain.value = volume / 100;
  } else {
    initMasterVolume(volume);
  }
};

const getPendingVolume = (): number | null => {
  return pendingVolume;
};

const resetMasterVolume = (): void => {
  gainNode = null;
  pendingVolume = null;
  clearPendingPoll();
};

const suspendAudio = (): void => {
  const sdl2 = getSDL2Audio();
  if (sdl2?.audioContext.state === 'running') {
    sdl2.audioContext.suspend();
  }
};

const resumeAudio = (): void => {
  const sdl2 = getSDL2Audio();
  if (sdl2?.audioContext.state === 'suspended') {
    sdl2.audioContext.resume();
  }
};

export {
  getPendingVolume,
  initMasterVolume,
  resetMasterVolume,
  resumeAudio,
  setMasterVolume,
  suspendAudio
};
