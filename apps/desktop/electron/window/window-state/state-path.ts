/* @layer electron-main @kind logic */
import { getUserDataPath } from '../../lib/paths';

const getStatePath = (): string => {
  return getUserDataPath('config', 'window-state.json');
};

export { getStatePath };
