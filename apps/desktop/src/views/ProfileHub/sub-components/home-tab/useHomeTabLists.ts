/* @layer renderer-components @kind hook */
import { useState, useEffect, useCallback } from 'react';
import type { NormalSaveInfo, AutoSaveInfo, PlaySession } from '@rotp/game-core';
import { onAutoSavesChanged } from '../../../../game/auto-save';
import { listSessions } from '../../../../game/session-tracker';
import { QUICK_SAVE_SLOTS, SESSION_LIST_LIMIT } from './home-tab.constants';
import { fetchQuickSlots } from './fetch-quick-slots';
import { fetchNormalSaves } from './fetch-normal-saves';
import { fetchAutoSaves } from './fetch-auto-saves';
import type { SlotInfo } from './home-tab.type';

const useHomeTabLists = (profileId: string) => {
  const [slots, setSlots] = useState<SlotInfo[]>(() =>
    Array.from({ length: QUICK_SAVE_SLOTS }, (_, i) => ({ slot: i, timestamp: null, screenshot: null }))
  );
  const [normalSaves, setNormalSaves] = useState<NormalSaveInfo[]>([]);
  const [normalScreenshots, setNormalScreenshots] = useState<Record<string, string>>({});
  const [autoSaves, setAutoSaves] = useState<AutoSaveInfo[]>([]);
  const [autoScreenshots, setAutoScreenshots] = useState<Record<string, string>>({});
  const [sessions, setSessions] = useState<PlaySession[]>([]);

  const loadQuickSlots = useCallback(async () => {
    const d = await fetchQuickSlots(profileId);
    if (d) setSlots(d);
  }, [profileId]);

  const loadNormalSaves = useCallback(async () => {
    const d = await fetchNormalSaves(profileId);
    if (d) { setNormalSaves(d.list); setNormalScreenshots(d.screenshots); }
  }, [profileId]);

  const loadAutoSaves = useCallback(async () => {
    const d = await fetchAutoSaves(profileId);
    if (d) { setAutoSaves(d.list); setAutoScreenshots(d.screenshots); }
  }, [profileId]);

  const loadSessions = useCallback(async () => {
    const list = await listSessions(profileId);
    setSessions(list.slice(0, SESSION_LIST_LIMIT));
  }, [profileId]);

  useEffect(() => {
    void loadQuickSlots();
    void loadNormalSaves();
    void loadAutoSaves();
    void loadSessions();
  }, [loadQuickSlots, loadNormalSaves, loadAutoSaves, loadSessions]);

  useEffect(() => onAutoSavesChanged(() => { void loadAutoSaves(); }), [loadAutoSaves]);

  return {
    slots, normalSaves, normalScreenshots, autoSaves, autoScreenshots, sessions,
    loadQuickSlots, loadNormalSaves, loadAutoSaves,
  };
};

export { useHomeTabLists };
