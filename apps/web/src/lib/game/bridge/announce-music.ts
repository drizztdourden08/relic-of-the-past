/* @layer bridge-wasm @kind logic */
import { voidCall } from './wasm-call';

const announceCoreMusic = (): void =>
  voidCall('WasmAnnounceMusic', { argTypes: [], args: [] });

export { announceCoreMusic };
