/* @layer bridge-wasm @kind logic */
/**
 * Host-only gate control over g_host_gates[0] (core/game-hooks/host_gates.h). These bits gate
 * behavior the core can never observe, so they need no Vanilla Safe handling. The core exposes a
 * whole-word setter, so the bits are mirrored here and the full word is rewritten on every change.
 */
import { voidCall } from './wasm-call';

// Bit assignment within host-gate word 0, mirroring the kHostGate_* enum in host_gates.h.
const HOST_GATE_SIMULATOR_SUPPORT = 1;
const HOST_GATE_EXTERNAL_MUSIC = 2;
const HOST_GATE_EXTERNAL_AMBIENT = 4;
// One bit for both effect channels: a pack claims individual ids per channel, so the two are
// never armed separately; the claim masks decide which sounds the host takes over.
const HOST_GATE_EXTERNAL_SFX = 8;
// Diagnostics: report every sound the game raises, claimed or not, without moving any of them
// off the sound chip. Never on in normal play. See setSoundTrace.
const HOST_GATE_SOUND_TRACE = 16;

let word = 0;

const push = (): void =>
  voidCall('WasmSetHostGateWord', { argTypes: ['number', 'number'], args: [0, word] });

const setBit = (bit: number, on: boolean): void => {
  const next = on ? word | bit : word & ~bit;
  if (next === word) return;
  word = next;
  push();
};

/**
 * Arm or disarm the simulator subsystem: the 9 WasmSim* mutators and TriggerGrantAllowed's
 * fallback (game_hooks_internal.h) only act while this is on. On right before a run, off as
 * soon as it ends (abort/crash included) so it never lingers against a live session.
 */
const setSimulatorSupport = (on: boolean): void => setBit(HOST_GATE_SIMULATOR_SUPPORT, on);

/** Hand music playback to the host: the core reports every music-control write via GameHook_MusicCtrl and keeps its own music channel silent. Off restores sound-chip music. */
const setExternalMusic = (on: boolean): void => setBit(HOST_GATE_EXTERNAL_MUSIC, on);

/** The same hand-over for the ambient bed: claimed ids (WasmSetSoundClaim) are reported instead of played; unclaimed ones stay on the chip. */
const setExternalAmbient = (on: boolean): void => setBit(HOST_GATE_EXTERNAL_AMBIENT, on);

/** The same for both effect channels, which share one bit. See the constant above. */
const setExternalSfx = (on: boolean): void => setBit(HOST_GATE_EXTERNAL_SFX, on);

/** Turn the sound trace on. Observational only: changes which sounds are REPORTED, never which the chip plays. */
const setSoundTrace = (on: boolean): void => setBit(HOST_GATE_SOUND_TRACE, on);

/** A fresh core starts with every gate clear; drop the mirror so it cannot go stale. */
const resetHostGates = (): void => { word = 0; };

/**
 * Push the mirror onto the core as it is, dedupe or not. A bit set BEFORE the module existed (a
 * debugger opened ahead of the game) was mirrored but never delivered, and setBit's dedupe would
 * treat later armings as done. Call once the module is installed.
 */
const reassertHostGates = (): void => { if (word !== 0) push(); };

export {
  setSimulatorSupport, setExternalMusic, setExternalAmbient, setExternalSfx, setSoundTrace,
  resetHostGates, reassertHostGates,
};
