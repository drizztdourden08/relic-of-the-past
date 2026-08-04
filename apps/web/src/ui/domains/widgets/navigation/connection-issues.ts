/* @layer renderer-widgets @kind logic */
/**
 * Per-connection completeness checks for the connection editor. Returns a list
 * of human-readable warnings instead of letting the editor silently render
 * nothing — so a manual reviewer can see exactly what a connection is missing.
 *
 * `tileDesc` is the already-resolved crossing description (persisted nav, else
 * live flood); a null/empty value means there is no tile data to show.
 *
 * The messages are named constants because a second reader now matches on them:
 * the shape detector turns the ones it can fix into real record edits, and
 * matching on a loose substring would break the moment the wording improved.
 */

import { findOne } from '@shared/game/data';
import type { ConnectionTag } from '@shared/game/data';

interface ConnectionIssueInput {
  from: string;
  to: string;
  tags: readonly ConnectionTag[];
}

const CONNECTION_ISSUE = {
  noTileData: '⚠ no tile data',
  noTransitType: '⚠ no transit type',
} as const;

const unknownScreen = (id: string): string => `⚠ unknown screen: ${id}`;

const screenExists = (id: string): boolean => findOne('screen', s => s.id === id) != null;

/** Direction is no longer a tag to check for — it is `canExit`, a required
 *  field the type system already guarantees is present (see `data/connections/derive.ts`). */
const connectionIssues = (conn: ConnectionIssueInput, tileDesc: string | null): string[] => {
  const issues: string[] = [];

  if (!tileDesc) issues.push(CONNECTION_ISSUE.noTileData);
  if (!screenExists(conn.from)) issues.push(unknownScreen(conn.from));
  if (!screenExists(conn.to)) issues.push(unknownScreen(conn.to));
  if (!conn.tags.some(t => t.startsWith('transit:'))) issues.push(CONNECTION_ISSUE.noTransitType);

  return issues;
};

export { CONNECTION_ISSUE, connectionIssues, unknownScreen };
export type { ConnectionIssueInput };
