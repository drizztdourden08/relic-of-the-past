/* @layer renderer-widgets @kind logic */
/**
 * Per-connection completeness checks for the connection editor. Returns a list
 * of human-readable warnings instead of letting the editor silently render
 * nothing — so a manual reviewer can see exactly what a connection is missing.
 *
 * `tileDesc` is the already-resolved crossing description (persisted nav, else
 * live flood); a null/empty value means there is no tile data to show.
 */

import { SCREEN_BY_ID } from '@shared/game/data/screens';
import type { ConnectionTag } from '@shared/game/data/connections/tags';

interface ConnectionIssueInput {
  from: string;
  to: string;
  tags: readonly ConnectionTag[];
}

const connectionIssues = (conn: ConnectionIssueInput, tileDesc: string | null): string[] => {
  const issues: string[] = [];

  if (!tileDesc) issues.push('⚠ no tile data');
  if (!SCREEN_BY_ID.has(conn.from)) issues.push(`⚠ unknown screen: ${conn.from}`);
  if (!SCREEN_BY_ID.has(conn.to)) issues.push(`⚠ unknown screen: ${conn.to}`);
  if (!conn.tags.some(t => t.startsWith('transit:'))) issues.push('⚠ no transit type');
  if (!conn.tags.some(t => t.startsWith('dir:'))) issues.push('⚠ no direction');

  return issues;
};

export { connectionIssues };
export type { ConnectionIssueInput };
