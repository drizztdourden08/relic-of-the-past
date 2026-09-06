/* @layer renderer-components @kind hook */
/**
 * Thin subscriber for the randomizer page. All session ownership lives in the
 * shared session store (lib/game/randomizer-client/session-store); this hook
 * only mirrors the store, the game-running gate and the page's activity feed
 * into React state.
 */
import { useEffect, useState } from 'react';
import { getSessionState, subscribeSessionStore } from '../../../../../../lib/game/randomizer-client';
import type { SessionStoreState } from '../../../../../../lib/game/randomizer-client';
import { getGameState, subscribeGameState } from '../../../../../../lib/game/wasm-bridge';
import { getEntries, subscribe as subscribeLog } from '../../../../../../lib/log-bus';
import type { LogEntry } from '../../../../../../lib/log-bus';

// The panel windows its own rows, so the feed keeps as much history as the bus
// itself does — a full plan application logs ~500 entries, and truncating to a
// screenful threw away the arm-time detail that is the whole point of reading it.
const MAX_LOG_ENTRIES = 1000;

// The activity panel shows the randomizer's own channel plus the error channel — a session
// failure that surfaces as a global error (a bad ccall, an unhandled rejection) must be
// visible on the page that caused it, not only in the Logs widget.
const isActivityEntry = (entry: LogEntry): boolean =>
  entry.channel === 'randomizer' || entry.channel === 'error';

const randomizerEntries = (): LogEntry[] =>
  getEntries().filter(isActivityEntry).slice(-MAX_LOG_ENTRIES);

const useRandomizerSession = () => {
  const [store, setStore] = useState<SessionStoreState>(getSessionState);
  const [gameRunning, setGameRunning] = useState(() => getGameState().status === 'running');
  const [entries, setEntries] = useState<LogEntry[]>(randomizerEntries);

  useEffect(() => subscribeSessionStore(setStore), []);
  useEffect(() => subscribeGameState((state) => setGameRunning(state.status === 'running')), []);

  useEffect(() => subscribeLog((entry) => {
    if (!isActivityEntry(entry)) return;
    setEntries((prev) => {
      const next = [...prev, entry];
      return next.length > MAX_LOG_ENTRIES ? next.slice(-MAX_LOG_ENTRIES) : next;
    });
  }), []);

  return {
    session: store.session,
    placement: store.placement,
    source: store.source,
    status: store.session?.status ?? 'idle',
    gameRunning,
    entries,
  };
};

export { useRandomizerSession };
