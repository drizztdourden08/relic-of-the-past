/* @layer electron-main @kind logic */
import { join } from 'path';

const getDataPath = (): string =>
  join(__dirname, '..', '..', 'public', 'data', 'shadow-casting.json');

export { getDataPath };
