/* @layer electron-main @kind logic */
import { join } from 'path';

const msulIcon = (): string => `"${join(process.resourcesPath, 'msul.ico')}",0`;

export { msulIcon };
