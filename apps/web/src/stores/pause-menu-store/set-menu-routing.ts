/* @layer renderer-stores @kind logic */
import { setMenuSinkOpen, setMenuSinkPush } from '@app/lib/input/scheme-runtime';
import { usePauseMenuStore } from './usePauseMenuStore';

let sinkWired = false;

const setMenuRouting = (open: boolean): void => {
  if (!sinkWired) {
    sinkWired = true;
    setMenuSinkPush((events) => {
      const { dispatch } = usePauseMenuStore.getState();
      for (const event of events) dispatch(event);
    });
  }
  setMenuSinkOpen(open);
};

export { setMenuRouting };
