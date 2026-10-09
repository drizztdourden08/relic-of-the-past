/* @layer electron-main @kind logic */
import { loadAddon } from './load-addon';

const isAvailable = (): boolean => loadAddon() !== null;

export { isAvailable };
