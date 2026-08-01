/* @layer renderer-components @kind hook */
import { useState, useEffect, useMemo } from 'react';
import { computeTrackerSnapshot } from '@shared/game/logic/eval';
import { resolveRules } from '@shared/game/logic/resolver';
import { VANILLA_CONFIG } from '@shared/game/data/presets';
import { find } from '@shared/game/data';
import type { CheckId, ItemId } from '@shared/game/data';
import { getCheckTags } from '@shared/game/logic/queries/check-tags';
import {
  onInventoryChanged, onUnknownItem, onCompletedChecksChanged,
  getCurrentInventory, getCompletedChecks, getUnknownItems, loadUnknownItems,
  getActiveProfileId,
} from '../../../../../../lib/game';
import type { UnknownItemEntry } from '../../../../../../lib/game';
import { loadTrackerState, saveTrackerState } from '@app/lib/storage/profile-data-store';
import type { CheckStatus } from '@shared/game/logic/eval';

const useTrackerState = () => {
  const [inventory, setInventory] = useState<Set<ItemId>>(() => getCurrentInventory());
  const [completedChecks, setCompletedChecks] = useState<Set<CheckId>>(() => getCompletedChecks());
  const [unknownItems, setUnknownItems] = useState<UnknownItemEntry[]>(() => getUnknownItems());

  useEffect(() => {
    const profileId = getActiveProfileId();
    if (!profileId) return;
    loadTrackerState(profileId).then((state: any) => {
      if (state?.unknownItems?.length) {
        loadUnknownItems(state.unknownItems);
        setUnknownItems(state.unknownItems);
      }
    });
  }, []);

  useEffect(() => onInventoryChanged((inv) => setInventory(new Set(inv))), []);
  useEffect(() => onCompletedChecksChanged((checks) => setCompletedChecks(new Set(checks))), []);
  useEffect(() => {
    return onUnknownItem((items) => {
      setUnknownItems([...items]);
      const profileId = getActiveProfileId();
      if (profileId) {
        saveTrackerState(profileId, { unknownItems: items });
      }
    });
  }, []);

  const checks = useMemo(() => find('check', () => true), []);
  const tagMap = useMemo(() => getCheckTags(checks), [checks]);
  const resolvedLogic = useMemo(() => resolveRules(VANILLA_CONFIG), []);
  const effectiveInventory = useMemo(() => {
    const merged = new Set(resolvedLogic.startInventory);
    for (const item of inventory) merged.add(item);
    return merged;
  }, [inventory, resolvedLogic]);
  const snapshot = useMemo(
    () => computeTrackerSnapshot(effectiveInventory, completedChecks, checks, resolvedLogic.connections, resolvedLogic.checkOverrides),
    [effectiveInventory, completedChecks, checks, resolvedLogic],
  );

  const stats = useMemo(() => {
    let completed = 0, reachable = 0, blocked = 0;
    for (const status of snapshot.values()) {
      if (status === 'completed') completed++;
      else if (status === 'reachable') reachable++;
      else blocked++;
    }
    return { completed, reachable, blocked, total: snapshot.size };
  }, [snapshot]);

  return { inventory, completedChecks, snapshot, tagMap, stats };
};

export { useTrackerState };
