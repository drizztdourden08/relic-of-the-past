/* @layer electron-main @kind logic */
import { app } from 'electron';
import { join } from 'path';
import { TOKEN_FILE } from './token-store.constants';

const tokenPath = (): string => join(app.getPath('userData'), TOKEN_FILE);

export { tokenPath };
