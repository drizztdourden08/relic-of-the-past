/* @layer bridge-wasm @kind logic */
/**
 * Core readiness — the one honest answer to "can the core take a command right now?".
 *
 * The renderer has a second, looser notion of "running": the game view has its asset blob
 * (useGameLifecycle's isRunning). The Emscripten module behind that view appears roughly two
 * seconds later, and everything gated on the loose flag — the save-state overlay, its
 * shortcuts, the Home tab's load buttons — is live for that whole gap. A command issued in
 * it used to find a null module and be dropped where it stood.
 *
 * So anything that reaches into the core orders itself against THIS, not against the flag.
 */
import { getGameState, getModule, subscribeGameState } from './wasm-bridge';

/** Generous: covers a boot that has to extract assets first. Nothing should ever reach it. */
const DEFAULT_TIMEOUT_MS = 30_000;

/** A live module AND a running core. Either one missing and the ccall goes nowhere. */
const isCoreReady = (): boolean => getModule() !== null && getGameState().status === 'running';

/**
 * Resolves true once the core can take a command, false if it never gets there.
 *
 * A request made mid-boot is not a mistake to drop — it is early. Waiting it out is what makes
 * "load slot 3" mean the same thing whether the core came up a second ago or is still a second
 * away. Resolves false on a crash, and on the timeout, so no caller waits forever.
 */
const whenCoreReady = (timeoutMs = DEFAULT_TIMEOUT_MS): Promise<boolean> => {
  if (isCoreReady()) return Promise.resolve(true);

  return new Promise((resolve) => {
    // Assigned synchronously below, before any listener can run: subscribeGameState replays the
    // current state on a microtask, never during the call itself.
    let settle: ((ready: boolean) => void) | null = null;

    const unsub = subscribeGameState((state) => {
      if (isCoreReady()) settle?.(true);
      else if (state.status === 'error') settle?.(false);
    });
    const timer = setTimeout(() => settle?.(false), timeoutMs);

    settle = (ready) => {
      settle = null;
      clearTimeout(timer);
      unsub();
      resolve(ready);
    };
  });
};

export { isCoreReady, whenCoreReady };
