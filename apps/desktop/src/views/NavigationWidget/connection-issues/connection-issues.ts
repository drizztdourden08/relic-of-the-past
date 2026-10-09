/* @layer renderer-widgets @kind logic */
import { findOne } from '@rotp/game-data';
import type { ConnectionIssueInput } from '../navigation.type';
import { CONNECTION_ISSUE } from './connection-issues.constants';
import { unknownScreen } from './unknown-screen';

const screenExists = (id: string): boolean => findOne('screen', s => s.id === id) != null;

const connectionIssues = (conn: ConnectionIssueInput, tileDesc: string | null): string[] => {
  const issues: string[] = [];

  if (!tileDesc) issues.push(CONNECTION_ISSUE.noTileData);
  if (!screenExists(conn.from)) issues.push(unknownScreen(conn.from));
  if (!screenExists(conn.to)) issues.push(unknownScreen(conn.to));
  if (!conn.tags.some(t => t.startsWith('transit:'))) issues.push(CONNECTION_ISSUE.noTransitType);

  return issues;
};

export { connectionIssues };
