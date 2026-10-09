/* @layer renderer-appshell @kind logic */
import { subscribeGameState } from '@app/game';

const waitForGameRunning = (isCancelled: () => boolean): Promise<void> => new Promise<void>((resolve) => {
  const unsub = subscribeGameState((state) => {
    if (isCancelled()) { unsub(); return; }
    if (state.status === 'running') {
      unsub();
      resolve();
    }
  });
});

export { waitForGameRunning };
