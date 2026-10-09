/* @layer bridge-wasm @kind logic */
import { wasmHostMenuSaveAndQuit } from '../bridge/host-menu';

const saveAndQuitHostMenu = (): void => wasmHostMenuSaveAndQuit();

export { saveAndQuitHostMenu };
