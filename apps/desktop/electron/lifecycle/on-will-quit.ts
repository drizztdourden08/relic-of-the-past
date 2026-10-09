/* @layer electron-main @kind logic */
import { stopInputHandlers } from '../input';
import { restoreOnShutdown } from '../display/mode-switch';

const onWillQuit = (): void => {
  stopInputHandlers();
  restoreOnShutdown();
};

export { onWillQuit };
