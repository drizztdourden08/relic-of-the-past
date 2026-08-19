/* @layer bridge-wasm @kind logic */
/**
 * Host-only gate control — g_host_gates[0] (core/game-hooks/host_gates.h). These bits gate
 * behavior the game core itself can never observe (see the header's own note), so they live
 * outside the WRAM feature words and need no Vanilla Safe handling.
 */
import { voidCall } from './wasm-call';

// Bit assignment within host-gate word 0 — mirrors kHostGate_SimulatorSupport in host_gates.h.
const HOST_GATE_SIMULATOR_SUPPORT = 1;

/**
 * Arm or disarm the simulator subsystem: the 9 WasmSim* mutators and TriggerGrantAllowed's
 * fallback (game_hooks_internal.h) only act while this is on. The simulator lifecycle turns it
 * on right before a run starts and off as soon as the run ends, including on abort/crash, so it
 * can never linger armed against a live (non-simulated) session.
 */
const setSimulatorSupport = (on: boolean): void =>
  voidCall('WasmSetHostGateWord', { argTypes: ['number', 'number'], args: [0, on ? HOST_GATE_SIMULATOR_SUPPORT : 0] });

export { setSimulatorSupport };
