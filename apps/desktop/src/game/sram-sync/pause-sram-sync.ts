/* @layer bridge-wasm @kind logic */
import { sramSyncHolder } from './sram-sync-holder';

const pauseSramSync = (): void => sramSyncHolder.current?.pause();

export { pauseSramSync };
