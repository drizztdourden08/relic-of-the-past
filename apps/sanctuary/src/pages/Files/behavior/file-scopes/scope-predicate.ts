/* @layer sanctuary-site @kind logic */
import { ALL_SCOPE_ID, MINE_SCOPE_ID } from '../../Files.constants';
import type { FilePredicate } from './file-scopes.type';

const scopePredicate = (scopeId: string, meId: string): FilePredicate => {
  if (scopeId === ALL_SCOPE_ID) return () => true;
  if (scopeId === MINE_SCOPE_ID) return (file) => file.owner.userId === meId;
  return (file) => file.type === scopeId;
};

export { scopePredicate };
