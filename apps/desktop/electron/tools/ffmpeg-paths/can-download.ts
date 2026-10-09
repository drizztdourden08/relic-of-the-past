/* @layer electron-main @kind logic */
import { isWindows } from './is-windows';

const canDownload = (): boolean => isWindows();

export { canDownload };
