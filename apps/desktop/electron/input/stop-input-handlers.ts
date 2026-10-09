/* @layer electron-main @kind logic */
import { sdl3Source } from './sdl3-source';

const stopInputHandlers = (): void => {
  sdl3Source.stop();
};

export { stopInputHandlers };
