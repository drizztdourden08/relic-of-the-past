/* @layer bridge-wasm @kind logic */
/**
 * Hands music back to the emulated sound chip.
 *
 * While the host produces music the core keeps its music port paused. Clearing the gate does
 * not undo that on its own: the port is only written when the music changes, and the core has
 * been tracking the current track all along, so it considers the track it wants already
 * playing and writes nothing. Without this the chip can stay silent indefinitely. The custom
 * player sprite and the HUD override each have a restore of their own for the same reason.
 */
import { voidCall } from './wasm-call';

/** Call while the external-music gate is still armed — the core checks it. */
const restoreCoreMusic = (): void =>
  voidCall('WasmRestoreMusic', { argTypes: [], args: [] });

export { restoreCoreMusic };
