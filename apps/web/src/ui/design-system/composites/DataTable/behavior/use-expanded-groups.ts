/* @layer renderer-components @kind hook */
/**
 * Collapse state for group rows — session tier only, because where you are in
 * a comparison is a position, not a preference.
 *
 * `SessionView.expanded` holds the nodes that ARE open, and a fresh grouping is
 * seeded with all of them: grouping a table and being shown nothing but a list
 * of headers reads as the table having broken. Re-seeding is keyed on the
 * groupBy signature, so collapsing survives every data change that follows.
 */
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { SessionView } from '@app/stores/data-view-store';
import type { GroupedRow } from '../../../data/table/types';
import { collectGroupUids } from './group-uid';

interface UseExpandedGroupsInput {
  groupedRows: readonly GroupedRow<unknown>[];
  groupBy: readonly string[];
  sessionView: SessionView;
  setSessionView: (next: SessionView) => void;
}

interface ExpandedGroups {
  isExpanded: (uid: string) => boolean;
  toggle: (uid: string) => void;
}

const sameMembers = (a: readonly string[], b: ReadonlySet<string>): boolean =>
  a.length === b.size && a.every((entry) => b.has(entry));

const useExpandedGroups = (input: UseExpandedGroupsInput): ExpandedGroups => {
  const { groupedRows, groupBy, sessionView, setSessionView } = input;
  const signature = groupBy.join('|');
  const seeded = useRef<string | null>(null);

  const expanded = useMemo(() => new Set(sessionView.expanded), [sessionView.expanded]);

  useEffect(() => {
    if (seeded.current === signature) return;
    seeded.current = signature;
    const all = collectGroupUids(groupedRows);
    if (sameMembers(all, expanded)) return;
    setSessionView({ ...sessionView, expanded: all });
    // Deliberately keyed on the grouping, not the rows: re-running when data
    // changes would silently re-open everything the user just collapsed.
  }, [signature, groupedRows]);

  const toggle = useCallback((uid: string) => {
    const next = expanded.has(uid)
      ? sessionView.expanded.filter((entry) => entry !== uid)
      : [...sessionView.expanded, uid];
    setSessionView({ ...sessionView, expanded: next });
  }, [expanded, sessionView, setSessionView]);

  const isExpanded = useCallback((uid: string) => expanded.has(uid), [expanded]);

  // A stable object, so a row-render context memoised on it does not churn.
  return useMemo(() => ({ isExpanded, toggle }), [isExpanded, toggle]);
};

export { useExpandedGroups };
export type { ExpandedGroups, UseExpandedGroupsInput };
