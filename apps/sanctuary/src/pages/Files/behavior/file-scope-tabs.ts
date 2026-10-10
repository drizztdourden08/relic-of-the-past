/* @layer sanctuary-site @kind logic */
import type { FileType } from '@rotp/hub-contracts';
import type { TabItem } from '@drizztdourden08/tessera/primitives';
import { FILE_SCOPES } from '../Files.constants';
import type { Scope } from '../Files.type';
import { isFileType } from './is-file-type';
import { scopePredicate } from './scope-predicate';
import type { FileLike } from './file-scopes.type';

const visibleScopes = (types: readonly FileType[]): Scope[] =>
  FILE_SCOPES.filter((scope) => !isFileType(scope.id) || types.includes(scope.id));

const fileScopeTabs = (files: readonly FileLike[], meId: string, types: readonly FileType[]): TabItem[] =>
  visibleScopes(types).map((scope) => ({
    id: scope.id,
    label: scope.label,
    badge: files.filter(scopePredicate(scope.id, meId)).length,
  }));

export { fileScopeTabs };
