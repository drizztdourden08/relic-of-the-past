import { useState, useEffect, useMemo } from 'react';
import { computeTrackerSnapshot } from '@shared/game/logic/eval';
import { resolveRules, VANILLA_CONFIG } from '@shared/game/logic/presets';
import { ALL_CHECKS } from '@shared/game/checks';
import { getCheckTags } from '@shared/game/checks/tags';
import {
  onInventoryChanged, onUnknownItem, onCompletedChecksChanged,
  getCurrentInventory, getCompletedChecks, getUnknownItems, loadUnknownItems,
  getActiveProfileId,
} from '../../../lib/game';
import type { UnknownItemEntry } from '../../../lib/game';
import type { CheckStatus } from '@shared/game/logic/eval';

function useTrackerState() {
  const [inventory, setInventory] = useState<Set<string>>(() => getCurrentInventory());
  const [completedChecks, setCompletedChecks] = useState<Set<string>>(() => getCompletedChecks());
  const [unknownItems, setUnknownItems] = useState<UnknownItemEntry[]>(() => getUnknownItems());

  useEffect(() => {
    const profileId = getActiveProfileId();
    if (!profileId) return;
    window.api.loadTrackerState(profileId).then((state: any) => {
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
        window.api.saveTrackerState(profileId, { unknownItems: items });
      }
    });
  }, []);

  const tagMap = useMemo(() => getCheckTags(ALL_CHECKS), []);
  const resolvedLogic = useMemo(() => resolveRules(VANILLA_CONFIG), []);
  const effectiveInventory = useMemo(() => {
    const merged = new Set(resolvedLogic.startInventory);
    for (const item of inventory) merged.add(item);
    return merged;
  }, [inventory, resolvedLogic]);
  const snapshot = useMemo(
    () => computeTrackerSnapshot(effectiveInventory, completedChecks, ALL_CHECKS, resolvedLogic.connections, resolvedLogic.regionRules, resolvedLogic.checkRules),
    [effectiveInventory, completedChecks, resolvedLogic],
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
}

export { useTrackerState };
