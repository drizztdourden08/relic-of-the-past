/* @layer sanctuary-site @kind logic */
/**
 * What the caller's rights let the site show. The API already filters every list and
 * answers 404 for what the caller cannot see; these only hide the tabs, choices and
 * links that would lead nowhere. An admin sees everything; no rights sees nothing.
 */
import { FILE_TYPES } from '@shared/sanctuary/file-types';
import type { FileType } from '@shared/sanctuary/file-types';
import type { Rights } from '@shared/sanctuary/group-types';

/** The file types the caller sees and uploads to, in the rail's order. */
const visibleFileTypes = (rights: Rights | null): readonly FileType[] => {
  if (!rights) return [];
  if (rights.admin) return FILE_TYPES;
  return FILE_TYPES.filter((type) => rights.fileTypes.includes(type));
};

const canSeeReports = (rights: Rights | null): boolean => Boolean(rights && (rights.admin || rights.reports));

export { visibleFileTypes, canSeeReports };
