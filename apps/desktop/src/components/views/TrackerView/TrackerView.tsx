import { useState, useEffect, useMemo } from 'react';
import type { CheckDefinition } from '@shared/types/tracker';
import type { CheckStatus } from '@shared/lib/logic-eval';
import { computeTrackerSnapshot } from '@shared/lib/logic-eval';
import { ALL_CHECKS } from '@shared/data/checks';
import { ALL_CONNECTIONS } from '@shared/data/regions';
import { REGION_RULES, CHECK_RULES } from '@shared/data/logic';
import {
  onInventoryChanged, onUnknownItem, onCompletedChecksChanged,
  getCurrentInventory, getCompletedChecks, getUnknownItems, loadUnknownItems,
  getActiveProfileId,
} from '../../../lib/game';
import type { UnknownItemEntry } from '../../../lib/game';
import { TrackerSummary } from './TrackerSummary';
import { TrackerRegionSection } from './TrackerRegionSection';
import './TrackerView.css';

interface TrackerViewProps {
  visible: boolean;
  onClose: () => void;
}

export function TrackerView({ visible, onClose }: TrackerViewProps): JSX.Element | null {
  const [inventory, setInventory] = useState<Set<string>>(() => getCurrentInventory());
  const [completedChecks, setCompletedChecks] = useState<Set<string>>(() => getCompletedChecks());
  const [unknownItems, setUnknownItems] = useState<UnknownItemEntry[]>(() => getUnknownItems());

  // Load persisted unknown items on mount
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

  useEffect(() => {
    return onInventoryChanged((inv) => setInventory(new Set(inv)));
  }, []);

  useEffect(() => {
    return onCompletedChecksChanged((checks) => setCompletedChecks(new Set(checks)));
  }, []);

  // Track unknown items and persist
  useEffect(() => {
    return onUnknownItem((items) => {
      setUnknownItems([...items]);
      const profileId = getActiveProfileId();
      if (profileId) {
        window.api.saveTrackerState(profileId, { unknownItems: items });
      }
    });
  }, []);

  const snapshot = useMemo(
    () => computeTrackerSnapshot(inventory, completedChecks, ALL_CHECKS, ALL_CONNECTIONS, REGION_RULES, CHECK_RULES),
    [inventory, completedChecks],
  );

  // Group checks by region
  const regionGroups = useMemo(() => {
    const groups = new Map<string, { checks: CheckDefinition[]; statuses: Map<string, CheckStatus> }>();
    for (const check of ALL_CHECKS) {
      const region = check.dungeon ?? check.region;
      if (!groups.has(region)) {
        groups.set(region, { checks: [], statuses: new Map() });
      }
      const group = groups.get(region)!;
      group.checks.push(check);
      group.statuses.set(check.id, snapshot.get(check.id) ?? 'blocked');
    }
    return groups;
  }, [snapshot]);

  // Summary stats
  const stats = useMemo(() => {
    let completed = 0, reachable = 0, blocked = 0;
    for (const status of snapshot.values()) {
      if (status === 'completed') completed++;
      else if (status === 'reachable') reachable++;
      else blocked++;
    }
    return { completed, reachable, blocked, total: snapshot.size };
  }, [snapshot]);

  if (!visible) return null;

  // Sort regions: dungeons first (by dungeon order), then overworld
  const dungeonOrder = [
    'Hyrule Castle', 'Castle Tower', 'Eastern Palace', 'Desert Palace',
    'Tower of Hera', 'Palace of Darkness', 'Swamp Palace',
    "Skull Woods", "Thieves' Town", 'Ice Palace',
    'Misery Mire', 'Turtle Rock', "Ganon's Tower",
  ];

  const sortedRegions = [...regionGroups.entries()].sort(([a], [b]) => {
    const ai = dungeonOrder.indexOf(a);
    const bi = dungeonOrder.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="tracker-view">
      <div className="tracker-view__header">
        <h2 className="tracker-view__title">Tracker</h2>
        <button className="tracker-view__close" onClick={onClose} aria-label="Close tracker">×</button>
      </div>

      <TrackerSummary {...stats} />

      {unknownItems.length > 0 && (
        <div className="tracker-view__unknown">
          <span className="tracker-view__unknown-label">Unmapped Items ({unknownItems.length})</span>
          <div className="tracker-view__unknown-list">
            {unknownItems.map((item, i) => (
              <span key={i} className="tracker-view__unknown-item">
                0x{item.id.toString(16).toUpperCase()} (method={item.method})
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="tracker-view__inventory">
        <span className="tracker-view__inventory-label">Inventory:</span>
        <span className="tracker-view__inventory-items">
          {inventory.size === 0 ? 'None' : [...inventory].sort().join(', ')}
        </span>
      </div>

      <div className="tracker-view__regions">
        {sortedRegions.map(([region, { checks, statuses }]) => (
          <TrackerRegionSection key={region} region={region} checks={checks} statuses={statuses} />
        ))}
      </div>
    </div>
  );
}
