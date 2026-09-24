/* @layer sanctuary-site @kind logic */
/**
 * The Files scopes over the loaded list: the predicate one tab stands for and a tab per
 * scope with its count as the badge. Counts are computed here from the one GET /files
 * page, since the API has no counts route yet. A type tab is offered only for the types
 * the caller may see.
 */
import type { FileType, SanctuaryFile } from '@shared/sanctuary/file-types';
import type { TabItem } from '@ds/primitives/TabBar';
import { FILE_SCOPES, MINE_SCOPE_ID, ALL_SCOPE_ID, isFileType } from '../Files.constants';
import type { Scope } from '../Files.constants';

/** The two fields a scope decides on, so the predicate runs on a record or on a table row. */
type FileLike = Pick<SanctuaryFile, 'type' | 'owner'>;

type FilePredicate = (file: FileLike) => boolean;

const scopePredicate = (scopeId: string, meId: string): FilePredicate => {
  if (scopeId === ALL_SCOPE_ID) return () => true;
  if (scopeId === MINE_SCOPE_ID) return (file) => file.owner.userId === meId;
  return (file) => file.type === scopeId;
};

/** All, one tab per visible type, then the caller's own. */
const visibleScopes = (types: readonly FileType[]): Scope[] =>
  FILE_SCOPES.filter((scope) => !isFileType(scope.id) || types.includes(scope.id));

const fileScopeTabs = (files: readonly FileLike[], meId: string, types: readonly FileType[]): TabItem[] =>
  visibleScopes(types).map((scope) => ({
    id: scope.id,
    label: scope.label,
    badge: files.filter(scopePredicate(scope.id, meId)).length,
  }));

/** A remembered tab for a type the caller can no longer see falls back to All. */
const shownScopeId = (scopeId: string, types: readonly FileType[]): string =>
  (isFileType(scopeId) && !types.includes(scopeId) ? ALL_SCOPE_ID : scopeId);

export { scopePredicate, fileScopeTabs, shownScopeId };
export type { FileLike, FilePredicate };
