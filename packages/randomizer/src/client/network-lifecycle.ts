/* @layer bridge-wasm @kind logic */
import { createNetworkFacts, observeClose } from './network-facts';
import type { LifecycleControl, NetworkLifecycle } from './network-monitor.type';

const createLifecycle = (control: LifecycleControl): NetworkLifecycle => {
  const { state, changed, forgetConnection, now } = control;
  return {
    opened(url) {
      state.facts.url = url;
      state.facts.error = null;
      changed();
    },
    closed() {
      forgetConnection();
      observeClose(state.facts);
      changed();
    },
    retrying(delayMs, attempt) {
      state.facts.reconnectAttempt = attempt;
      state.facts.nextRetryAt = now() + delayMs;
      state.facts.retryInFlight = false;
      changed();
    },
    attempting() {
      state.facts.nextRetryAt = null;
      state.facts.retryInFlight = true;
      changed();
    },
    failed(message) {
      state.facts.error = message.replace(/^\[Online\]\s*/, '');
      changed();
    },
    stop() {
      forgetConnection();
      changed();
    },
    reset() {
      forgetConnection();
      state.facts = createNetworkFacts();
    },
  };
};

export { createLifecycle };
