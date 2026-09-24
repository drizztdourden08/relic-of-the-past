/* @layer sanctuary-site @kind logic */
/**
 * The Files scopes over the loaded list: the predicate one tab stands for and a tab per
 * scope with its count as the badge. Counts are computed here from the one GET /files
 * page, since the API has no counts route yet.
 */
import type { SanctuaryFile } from '@shared/sanctuary/file-types';
import type { TabItem } from '@ds/primitives/TabBar';
import { FILE_SCOPES, MINE_SCOPE_ID, ALL_SCOPE_ID } from '../Files.constants';

/** The two fields a scope decides on, so the predicate runs on a record or on a table row. */
type FileLike = Pick<SanctuaryFile, 'type' | 'owner'>;

type FilePredicate = (file: FileLike) => boolean;

const scopePredicate = (scopeId: string, meId: string): FilePredicate => {
  if (scopeId === ALL_SCOPE_ID) return () => true;
  if (scopeId === MINE_SCOPE_ID) return (file) => file.owner.userId === meId;
  return (file) => file.type === scopeId;
};

const fileScopeTabs = (files: readonly FileLike[], meId: string): TabItem[] =>
  FILE_SCOPES.map((scope) => ({
    id: scope.id,
    label: scope.label,
    badge: files.filter(scopePredicate(scope.id, meId)).length,
  }));

export { scopePredicate, fileScopeTabs };
export type { FileLike, FilePredicate };
