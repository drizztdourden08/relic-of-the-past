/* @layer bridge-wasm @kind logic */
/**
 * Host-only gate control — g_host_gates[0] (core/game-hooks/host_gates.h). These bits gate
 * behavior the game core itself can never observe (see the header's own note), so they live
 * outside the WRAM feature words and need no Vanilla Safe handling.
 *
 * The core exposes a whole-word setter, so the bits are tracked here and the full word is
 * rewritten on every change — otherwise arming one subsystem would silently disarm another.
 */
import { voidCall } from './wasm-call';

// Bit assignment within host-gate word 0 — mirrors the kHostGate_* enum in host_gates.h.
const HOST_GATE_SIMULATOR_SUPPORT = 1;
const HOST_GATE_EXTERNAL_MUSIC = 2;
const HOST_GATE_EXTERNAL_AMBIENT = 4;
// One bit for both effect channels: a pack claims individual ids per channel, so the two are
// never armed separately — the claim masks are what decide which sounds the host takes over.
const HOST_GATE_EXTERNAL_SFX = 8;
// Diagnostics: report every sound the game raises, claimed or not, without moving any of them
// off the sound chip. Never on in normal play — see setSoundTrace.
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
 * fallback (game_hooks_internal.h) only act while this is on. The simulator lifecycle turns it
 * on right before a run starts and off as soon as the run ends, including on abort/crash, so it
 * can never linger armed against a live (non-simulated) session.
 */
const setSimulatorSupport = (on: boolean): void => setBit(HOST_GATE_SIMULATOR_SUPPORT, on);

/**
 * Hand music playback to the host. While on, the core reports every music-control write via
 * GameHook_MusicCtrl and keeps its own music channel silent, so the app's audio engine is the
 * only thing producing music. Off restores the original sound-chip music entirely.
 */
const setExternalMusic = (on: boolean): void => setBit(HOST_GATE_EXTERNAL_MUSIC, on);

/**
 * The same hand-over for the ambient bed. While on, the core reports the ambient sounds whose
 * claim bit is set (WasmSetSoundClaim) instead of playing them, and leaves every unclaimed one
 * on the sound chip.
 */
const setExternalAmbient = (on: boolean): void => setBit(HOST_GATE_EXTERNAL_AMBIENT, on);

/** The same for both effect channels, which share one bit — see the constant above. */
const setExternalSfx = (on: boolean): void => setBit(HOST_GATE_EXTERNAL_SFX, on);

/**
 * Turn the sound trace on. Purely observational: it changes which sounds are REPORTED, never
 * which of them the chip still plays, so a traced session sounds exactly like an untraced one.
 */
const setSoundTrace = (on: boolean): void => setBit(HOST_GATE_SOUND_TRACE, on);

/** A fresh core starts with every gate clear; drop the mirror so it cannot go stale. */
const resetHostGates = (): void => { word = 0; };

/**
 * Push the mirror onto the core as it is, dedupe or not. A bit set BEFORE the module existed —
 * a debugger opened ahead of the game — was mirrored but never delivered, and setBit's dedupe
 * would then treat every later arming of it as already done. Call once the module is installed.
 */
const reassertHostGates = (): void => { if (word !== 0) push(); };

export {
  setSimulatorSupport, setExternalMusic, setExternalAmbient, setExternalSfx, setSoundTrace,
  resetHostGates, reassertHostGates,
};
