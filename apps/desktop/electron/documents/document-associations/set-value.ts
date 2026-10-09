/* @layer electron-main @kind logic */
import { reg } from './reg';

const setValue = (key: string, name: string | null, data: string): void => {
  reg(['add', key, ...(name === null ? ['/ve'] : ['/v', name]), '/t', 'REG_SZ', '/d', data, '/f']);
};

export { setValue };
