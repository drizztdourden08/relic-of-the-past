/* @layer bridge-wasm @kind logic */
import { sramSyncHolder } from './sram-sync-holder';

const resumeSramSync = (): void => sramSyncHolder.current?.resume();

export { resumeSramSync };
