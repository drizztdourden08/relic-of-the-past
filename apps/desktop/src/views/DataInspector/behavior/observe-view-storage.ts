/* @layer renderer-app @kind logic */
import type { ViewKey, ViewSnapshot, ViewStorage } from '@drizztdourden08/tessera/data';

const observeViewStorage = (
  base: ViewStorage,
  key: ViewKey,
  onSnapshot: (snapshot: ViewSnapshot | undefined) => void,
): ViewStorage => {
  let edited = false;
  return {
    load: (target) => base.load(target).then((snapshot) => {
      if (target === key && !edited) onSnapshot(snapshot);
      return snapshot;
    }),
    save: (target, snapshot) => {
      base.save(target, snapshot);
      if (target !== key) return;
      edited = true;
      onSnapshot(snapshot);
    },
  };
};

export { observeViewStorage };
