/**
 * Master volume control via Web Audio GainNode.
 * Inserts a gain node between SDL2's ScriptProcessorNode and the AudioContext destination.
 */

import { getModule } from './wasm-bridge';

let gainNode: GainNode | null = null;
let pendingVolume: number | null = null;

/**
 * Hook into the SDL2 audio pipeline to insert a master gain node.
 * Must be called after the WASM module is running and audio is initialized.
 */
export function initMasterVolume(volume: number): void {
  const mod = getModule();
  const sdl2 = (mod as any)?.SDL2 as
    | { audioContext?: AudioContext; audio?: { scriptProcessorNode?: AudioNode } }
    | undefined;

  if (!sdl2?.audioContext || !sdl2?.audio?.scriptProcessorNode) {
    // Audio not initialized yet — store for later
    pendingVolume = volume;
    return;
  }

  const ctx = sdl2.audioContext;
  const source = sdl2.audio.scriptProcessorNode;

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
export function setMasterVolume(volume: number): void {
  if (gainNode) {
    gainNode.gain.value = volume / 100;
  } else {
    initMasterVolume(volume);
  }
}

/**
 * Get pending volume if audio wasn't ready when first set.
 */
export function getPendingVolume(): number | null {
  return pendingVolume;
}

/**
 * Reset state when game stops.
 */
export function resetMasterVolume(): void {
  gainNode = null;
  pendingVolume = null;
}
