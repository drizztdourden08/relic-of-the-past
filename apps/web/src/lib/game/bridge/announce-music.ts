/* @layer bridge-wasm @kind logic */
/**
 * Asks the core to re-report the music and the ambient bed it is playing.
 *
 * The mirror image of restore-music. The core only writes its control port when the music
 * CHANGES, so an engine that attaches after a selection (behind a boot-time state load, or
 * because the audio context came up late) has missed it and will wait in silence for the next
 * one. Call once the handlers are registered and the gate is armed: the core checks both.
 */
import { voidCall } from './wasm-call';

const announceCoreMusic = (): void =>
  voidCall('WasmAnnounceMusic', { argTypes: [], args: [] });

export { announceCoreMusic };
