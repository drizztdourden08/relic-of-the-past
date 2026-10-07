/* @layer shared-hub @kind logic */
/**
 * The one question every rights check asks: does this caller hold this permission on the
 * site being called. An admin holds every one; no rights holds none.
 */
import type { Rights } from './group-types';

const hasRight = (rights: Rights | null, permission: string): boolean =>
  Boolean(rights && (rights.admin || rights.permissions.includes(permission)));

export { hasRight };
