/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import { getSessionState, subscribeSessionStore } from '../../../game/randomizer-client';
import type { SessionStoreState } from '../../../game/randomizer-client';
import { getGameState, subscribeGameState } from '@rotp/game-core';
import { getEntries, subscribe as subscribeLog } from '../../../log-bus';
import type { LogEntry } from '../../../log-bus';
import { MAX_LOG_ENTRIES } from './useRandomizerSession.constants';

const isRandomizerOrErrorEntry = (entry: LogEntry): boolean =>
  entry.channel === 'randomizer' || entry.channel === 'error';

const randomizerEntries = (): LogEntry[] =>
  getEntries().filter(isRandomizerOrErrorEntry).slice(-MAX_LOG_ENTRIES);

const useRandomizerSession = () => {
  const [store, setStore] = useState<SessionStoreState>(getSessionState);
  const [gameRunning, setGameRunning] = useState(() => getGameState().status === 'running');
  const [entries, setEntries] = useState<LogEntry[]>(randomizerEntries);

  useEffect(() => subscribeSessionStore(setStore), []);
  useEffect(() => subscribeGameState((state) => setGameRunning(state.status === 'running')), []);

  useEffect(() => subscribeLog((entry) => {
    if (!isRandomizerOrErrorEntry(entry)) return;
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
