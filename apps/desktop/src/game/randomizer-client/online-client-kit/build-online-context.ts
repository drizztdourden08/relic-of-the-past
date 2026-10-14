/* @layer bridge-wasm @kind logic */
import type { OnlineContext } from '@rotp/randomizer';
import type { ClientKit, ContextHooks } from './online-client-kit.type';

const buildOnlineContext = (kit: ClientKit, hooks: ContextHooks): OnlineContext => {
  const { config, deps, game, state, room, maps, names, messages, goal, send, reportCheck, placementListeners, deathLinks } = kit;
  return {
    config, game, core: deps.core, room, maps, names, messages, goal, send,
    fail: hooks.fail,
    reporter: { reportCheck },
    markConnected: hooks.markConnected,
    isLive: () => !state.stopped,
    setPlacement: (next, foreignOwners = {}) => {
      state.placement = next;
      placementListeners.emit(next, foreignOwners);
    },
    setDeathLink: (enabled) => deathLinks.set(enabled),
  };
};

export { buildOnlineContext };
