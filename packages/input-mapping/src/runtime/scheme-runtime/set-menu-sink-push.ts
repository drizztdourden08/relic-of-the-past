/* @layer renderer-lib @kind logic */
import type { PauseEvent } from '@rotp/game-data';
import { schemeRuntime } from './scheme-runtime-state';

const setMenuSinkPush = (push: (events: PauseEvent[]) => void): void => {
  schemeRuntime.menuSink.push = push;
};

export { setMenuSinkPush };
