/* @layer shared-sanctuary @kind logic */
/**
 * What a group can grant on the Sanctuary: one permission per file type (the shelves it
 * sees and uploads to) and the Reports page. Filing a report from the app is never gated.
 * The API and the site ask the same helpers, so a shelf is hidden and refused alike.
 */
import { hasRight } from '../hub/rights';
import type { Rights } from '../hub/group-types';
import type { RightsModel } from '../hub/rights-model.type';
import { FILE_TYPES, FILE_TYPE_SHELF_LABELS } from './file-types';
import type { FileType } from './file-types';

type FilePermission = `files:${FileType}`;
type SanctuaryPermission = FilePermission | 'reports';

const REPORTS_PERMISSION = 'reports';

const filePermission = (type: FileType): FilePermission => `files:${type}`;

const FILE_PERMISSIONS: readonly FilePermission[] = FILE_TYPES.map(filePermission);

const LABELS = {
  ...Object.fromEntries(FILE_TYPES.map((type) => [filePermission(type), FILE_TYPE_SHELF_LABELS[type]])),
  reports: 'Reports',
} as Record<SanctuaryPermission, string>;

const typesText = (granted: readonly string[]): string => {
  const types = FILE_TYPES.filter((type) => granted.includes(filePermission(type)));
  if (types.length === 0) return 'no file types';
  if (types.length === FILE_TYPES.length) return 'all file types';
  return types.map((type) => FILE_TYPE_SHELF_LABELS[type]).join(', ');
};

const SANCTUARY_RIGHTS: RightsModel<SanctuaryPermission> = {
  site: 'sanctuary',
  all: [...FILE_PERMISSIONS, REPORTS_PERMISSION],
  labels: LABELS,
  describe: (granted) => [typesText(granted), ...(granted.includes(REPORTS_PERMISSION) ? ['reports'] : [])].join(' · '),
};

const canSeeType = (rights: Rights | null, type: FileType): boolean => hasRight(rights, filePermission(type));

const canSeeReports = (rights: Rights | null): boolean => hasRight(rights, REPORTS_PERMISSION);

/** The file types the caller sees and uploads to, in the rail's order. */
const visibleFileTypes = (rights: Rights | null): readonly FileType[] =>
  (rights?.admin ? FILE_TYPES : FILE_TYPES.filter((type) => canSeeType(rights, type)));

export { SANCTUARY_RIGHTS, REPORTS_PERMISSION, filePermission, canSeeType, canSeeReports, visibleFileTypes };
export type { SanctuaryPermission, FilePermission };
