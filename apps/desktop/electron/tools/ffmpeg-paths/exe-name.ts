/* @layer electron-main @kind logic */
import { isWindows } from './is-windows';

const exeName = (stem: string): string => (isWindows() ? `${stem}.exe` : stem);

export { exeName };
