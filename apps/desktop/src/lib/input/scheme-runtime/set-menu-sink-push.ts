/* @layer renderer-lib @kind logic */
import type { PauseEvent } from '@shared/game/logic/pause';
import { schemeRuntime } from './scheme-runtime-state';

const setMenuSinkPush = (push: (events: PauseEvent[]) => void): void => {
  schemeRuntime.menuSink.push = push;
};

export { setMenuSinkPush };
