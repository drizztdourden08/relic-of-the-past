/* @layer shared-hub @kind logic */
import type { Rights } from './group-types';

const hasRight = (rights: Rights | null, permission: string): boolean =>
  Boolean(rights && (rights.admin || rights.permissions.includes(permission)));

export { hasRight };
