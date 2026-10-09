/* @layer sanctuary-site @kind logic */
import type { FileType } from '@rotp/hub-contracts';
import { ALL_SCOPE_ID } from '../../Files.constants';
import { isFileType } from '../is-file-type';

const shownScopeId = (scopeId: string, types: readonly FileType[]): string =>
  (isFileType(scopeId) && !types.includes(scopeId) ? ALL_SCOPE_ID : scopeId);

export { shownScopeId };
