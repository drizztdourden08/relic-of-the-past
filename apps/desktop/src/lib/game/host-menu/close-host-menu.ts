/* @layer bridge-wasm @kind logic */
import { wasmHostMenuClose } from '../bridge/host-menu';

const closeHostMenu = (): void => wasmHostMenuClose();

export { closeHostMenu };
