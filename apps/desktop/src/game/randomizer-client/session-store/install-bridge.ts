/* @layer bridge-wasm @kind logic */
import { useSessionStore } from '@drizztdourden08/brock-randomizer/session';
import { notifySessionStore } from './notify-session-store';
import { releaseSession } from './release-session';

const bridge = { installed: false };

const installBridge = (): void => {
  if (bridge.installed) return;
  bridge.installed = true;
  useSessionStore.subscribe((state, previous) => {
    if (state.session !== previous.session) releaseSession(previous.session);
    notifySessionStore();
  });
};

export { installBridge };
