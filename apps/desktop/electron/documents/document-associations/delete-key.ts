/* @layer electron-main @kind logic */
import { reg } from './reg';

const deleteKey = (key: string): void => {
  try {
    reg(['delete', key, '/f']);
  } catch {
    return;
  }
};

export { deleteKey };
