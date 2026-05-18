import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { CheckDefinition } from '@shared/game/types';
import type { CheckStatus } from '@shared/game/logic/eval';
import { computeTrackerSnapshot } from '@shared/game/logic/eval';
import { resolveRules, VANILLA_CONFIG } from '@shared/game/logic/presets';
import { ALL_CHECKS } from '@shared/game/checks';
import { getCheckTags } from '@shared/game/checks/tags';
import type { GroupDimension, FilterState } from '@shared/game/checks/grouping';
import { buildGroupTree, filterChecks } from '@shared/game/checks/grouping';
import {
  onInventoryChanged, onUnknownItem, onCompletedChecksChanged,
  getCurrentInventory, getCompletedChecks, getUnknownItems, loadUnknownItems,
  getActiveProfileId,
} from '../../../lib/game';
import type { UnknownItemEntry } from '../../../lib/game';
import { SegmentedControl, Slider } from '../../primitives';
import { TrackerSummary } from './sub-components/TrackerSummary';
import { TrackerInventory } from './sub-components/TrackerInventory';
import { TrackerFilters, type ViewMode } from './sub-components/TrackerFilters';
import { TrackerGroupTree } from './sub-components/TrackerGroupTree';
import './TrackerView.css';
import type { PanelSide, PanelSettings, TrackerLayoutSettings, PanelHeaderProps, TrackerPanelProps, TrackerViewProps } from './types';
import { STORAGE_KEY, MODE_OPTIONS } from './constants';

// ─── Panel Settings ───

function defaultPanel(side: PanelSide = 'right', x = 100, y = 100): PanelSettings {
  return { mode: 'docked', side, opacity: 1.0, x, y };
}

function defaultLayout(): TrackerLayoutSettings {
  return { combined: true, inventory: defaultPanel('right'), checks: defaultPanel('right', 150, 150) };
}

function loadLayout(): TrackerLayoutSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...defaultLayout(),
        ...parsed,
        inventory: { ...defaultPanel('right'), ...parsed.inventory },
        checks: { ...defaultPanel('right', 150, 150), ...parsed.checks },
      };
    }
  } catch {}
  return defaultLayout();
}

function saveLayout(s: TrackerLayoutSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

// ─── Draggable panel hook ───

function useDrag(pos: { x: number; y: number }, onMove: (x: number, y: number) => void) {
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const startDrag = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    const onMouseMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      onMove(ev.clientX - offset.current.x, ev.clientY - offset.current.y);
    };
    const onMouseUp = () => {
      dragging.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [pos.x, pos.y, onMove]);

  return startDrag;
}

// ─── Shared data hook ───

function useTrackerData() {
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

// ─── Panel Header (toolbar) ───

function PanelHeader({ title, panelSettings, onSettingsChange, onClose, onPopOut, onDock, showPopOut, onMouseDown }: PanelHeaderProps) {
  const modeValue = panelSettings.mode === 'floating' ? 'float' : panelSettings.side;

  return (
    <div className="tracker-panel__header" onMouseDown={onMouseDown}>
      <span className="tracker-panel__title">{title}</span>
      <div className="tracker-panel__controls">
        <SegmentedControl
          value={modeValue}
          options={MODE_OPTIONS}
          onChange={(v) => {
            if (v === 'float') onSettingsChange(s => ({ ...s, mode: 'floating' }));
            else onSettingsChange(s => ({ ...s, mode: 'docked', side: v }));
          }}
        />
        <Slider
          value={Math.round(panelSettings.opacity * 100)}
          min={20}
          max={100}
          step={5}
          onChange={(v) => onSettingsChange(s => ({ ...s, opacity: v / 100 }))}
          showValue={false}
        />
        {showPopOut && onPopOut && (
          <button className="tracker-panel__icon-btn" onClick={onPopOut} title="Pop out">⎋</button>
        )}
        {onDock && (
          <button className="tracker-panel__icon-btn" onClick={onDock} title="Dock back">⎌</button>
        )}
        <button className="tracker-panel__icon-btn" onClick={onClose} title="Close">×</button>
      </div>
    </div>
  );
}

// ─── Single Panel Shell ───

function TrackerPanel({ panelSettings, children, className = '', onDragStart }: TrackerPanelProps) {
  const [hovered, setHovered] = useState(false);
  const { mode, side, opacity } = panelSettings;

  const frameOpacity = hovered ? 1 : opacity;

  const cls = [
    'tracker-panel',
    `tracker-panel--${mode}`,
    mode === 'docked' && `tracker-panel--${side}`,
    className,
  ].filter(Boolean).join(' ');

  const style: React.CSSProperties = {
    '--tracker-frame-opacity': frameOpacity,
    ...(mode === 'floating' ? { left: panelSettings.x, top: panelSettings.y } : {}),
  } as React.CSSProperties;

  return (
    <div
      className={cls}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  );
}

// ─── Main TrackerView ───


const TrackerView = (props: TrackerViewProps) => {
  const { visible, onClose } = props;
  const [layout, setLayoutRaw] = useState<TrackerLayoutSettings>(loadLayout);
  const [viewMode, setViewMode] = useState<ViewMode>('compact');
  const [grouping, setGrouping] = useState<GroupDimension[]>(['world', 'dungeon']);
  const [filter, setFilter] = useState<FilterState>({ searchQuery: '', activeTags: [], tagMode: 'any' });

  const { inventory, snapshot, tagMap, stats } = useTrackerData();

  const setLayout = useCallback((updater: (prev: TrackerLayoutSettings) => TrackerLayoutSettings) => {
    setLayoutRaw(prev => {
      const next = updater(prev);
      saveLayout(next);
      return next;
    });
  }, []);

  const setInventoryPanel = useCallback((updater: (p: PanelSettings) => PanelSettings) => {
    setLayout(l => ({ ...l, inventory: updater(l.inventory) }));
  }, [setLayout]);

  const setChecksPanel = useCallback((updater: (p: PanelSettings) => PanelSettings) => {
    setLayout(l => ({ ...l, checks: updater(l.checks) }));
  }, [setLayout]);

  // Drag handlers for floating panels
  const inventoryDrag = useDrag(
    { x: layout.inventory.x, y: layout.inventory.y },
    useCallback((x, y) => setInventoryPanel(s => ({ ...s, x, y })), [setInventoryPanel]),
  );
  const checksDrag = useDrag(
    { x: layout.checks.x, y: layout.checks.y },
    useCallback((x, y) => setChecksPanel(s => ({ ...s, x, y })), [setChecksPanel]),
  );

  // Filter & group tree
  const filteredChecks = useMemo(() => filterChecks(ALL_CHECKS, filter, tagMap, snapshot), [filter, tagMap, snapshot]);
  const groupTree = useMemo(() => buildGroupTree(filteredChecks, snapshot, grouping, tagMap), [filteredChecks, snapshot, grouping, tagMap]);

  if (!visible) return null;

  const { combined } = layout;

  // ─── Combined mode: both in one panel ───
  if (combined) {
    const ps = layout.inventory; // Use inventory panel settings for combined

    return (
      <TrackerPanel panelSettings={ps} onDragStart={ps.mode === 'floating' ? inventoryDrag : undefined}>
        <PanelHeader
          title="Tracker"
          panelSettings={ps}
          onSettingsChange={setInventoryPanel}
          onClose={onClose}
          showPopOut
          onPopOut={() => setLayout(l => ({ ...l, combined: false }))}
          onMouseDown={ps.mode === 'floating' ? inventoryDrag : undefined}
        />

        <TrackerInventory inventory={inventory} />
        <TrackerSummary {...stats} />

        <TrackerFilters
          filter={filter}
          onFilterChange={setFilter}
          grouping={grouping}
          onGroupingChange={setGrouping}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {(filter.searchQuery || filter.activeTags.length > 0 || (filter.statusFilter && filter.statusFilter !== 'all')) && (
          <div className="tracker-view__filtered-stats">
            Showing {groupTree.stats.total} checks:
            <span className="tracker-summary__stat--completed"> {groupTree.stats.completed} done</span>,
            <span className="tracker-summary__stat--reachable"> {groupTree.stats.reachable} available</span>,
            <span className="tracker-summary__stat--blocked"> {groupTree.stats.blocked} blocked</span>
          </div>
        )}

        <div className="tracker-view__checks">
          <TrackerGroupTree node={groupTree} statuses={snapshot} viewMode={viewMode} />
        </div>
      </TrackerPanel>
    );
  }

  // ─── Split mode: two independent panels ───
  return (
    <>
      {/* Inventory panel */}
      <TrackerPanel panelSettings={layout.inventory} className="tracker-panel--compact">
        <PanelHeader
          title="Inventory"
          panelSettings={layout.inventory}
          onSettingsChange={setInventoryPanel}
          onClose={onClose}
          onDock={() => setLayout(l => ({ ...l, combined: true }))}
          onMouseDown={layout.inventory.mode === 'floating' ? inventoryDrag : undefined}
        />
        <TrackerInventory inventory={inventory} />
      </TrackerPanel>

      {/* Checks panel */}
      <TrackerPanel panelSettings={layout.checks}>
        <PanelHeader
          title="Checks"
          panelSettings={layout.checks}
          onSettingsChange={setChecksPanel}
          onClose={onClose}
          onDock={() => setLayout(l => ({ ...l, combined: true }))}
          onMouseDown={layout.checks.mode === 'floating' ? checksDrag : undefined}
        />
        <TrackerSummary {...stats} />

        <TrackerFilters
          filter={filter}
          onFilterChange={setFilter}
          grouping={grouping}
          onGroupingChange={setGrouping}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {(filter.searchQuery || filter.activeTags.length > 0 || (filter.statusFilter && filter.statusFilter !== 'all')) && (
          <div className="tracker-view__filtered-stats">
            Showing {groupTree.stats.total} checks:
            <span className="tracker-summary__stat--completed"> {groupTree.stats.completed} done</span>,
            <span className="tracker-summary__stat--reachable"> {groupTree.stats.reachable} available</span>,
            <span className="tracker-summary__stat--blocked"> {groupTree.stats.blocked} blocked</span>
          </div>
        )}

        <div className="tracker-view__checks">
          <TrackerGroupTree node={groupTree} statuses={snapshot} viewMode={viewMode} />
        </div>
      </TrackerPanel>
    </>
  );
};

export { TrackerView };
