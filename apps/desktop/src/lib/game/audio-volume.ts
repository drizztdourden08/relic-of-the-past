/**
 * Master volume control via Web Audio GainNode.
 * Inserts a gain node between SDL2's ScriptProcessorNode and the AudioContext destination.
 */

import { getModule } from './wasm-bridge';

let gainNode: GainNode | null = null;
let pendingVolume: number | null = null;

function getSDL2Audio(): { audioContext: AudioContext; scriptProcessorNode: AudioNode } | null {
  const mod = getModule();
  const sdl2 = (mod as any)?.SDL2 as
    | { audioContext?: AudioContext; audio?: { scriptProcessorNode?: AudioNode } }
    | undefined;
  if (!sdl2?.audioContext || !sdl2?.audio?.scriptProcessorNode) return null;
  return { audioContext: sdl2.audioContext, scriptProcessorNode: sdl2.audio.scriptProcessorNode };
}

/**
 * Hook into the SDL2 audio pipeline to insert a master gain node.
 * Must be called after the WASM module is running and audio is initialized.
 */
function initMasterVolume(volume: number): void {
  const sdl2 = getSDL2Audio();
  if (!sdl2) {
    pendingVolume = volume;
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
}

/**
 * Set the master volume (0–100). Works whether or not audio is initialized.
 */
function setMasterVolume(volume: number): void {
  if (gainNode) {
    gainNode.gain.value = volume / 100;
  } else {
    initMasterVolume(volume);
  }
}

/**
 * Get pending volume if audio wasn't ready when first set.
 */
function getPendingVolume(): number | null {
  return pendingVolume;
}

/**
 * Reset state when game stops.
 */
function resetMasterVolume(): void {
  gainNode = null;
  pendingVolume = null;
}

/**
 * Suspend audio output (mute by suspending AudioContext).
 * Used when game is paused to silence music.
 */
function suspendAudio(): void {
  const sdl2 = getSDL2Audio();
  if (sdl2?.audioContext.state === 'running') {
    sdl2.audioContext.suspend();
  }
}

/**
 * Resume audio output after pause.
 */
function resumeAudio(): void {
  const sdl2 = getSDL2Audio();
  if (sdl2?.audioContext.state === 'suspended') {
    sdl2.audioContext.resume();
  }
}

export {
  getPendingVolume,
  initMasterVolume,
  resetMasterVolume,
  resumeAudio,
  setMasterVolume,
  suspendAudio
};
