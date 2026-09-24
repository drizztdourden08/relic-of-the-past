/* @layer root-config @kind logic */
/** A caller's rights: the union of their groups' rights, or every file type
 *  and the reports for an admin. Routes ask the Rights value, never the groups. */
import { FILE_TYPES } from '../../../../shared/sanctuary';
import type { Group, GroupRights, Rights } from '../../../../shared/sanctuary';

const NOTHING: GroupRights = { fileTypes: [], reports: false };

const unionOf = (acc: GroupRights, group: Group): GroupRights => ({
  fileTypes: Array.from(new Set([...acc.fileTypes, ...group.rights.fileTypes])),
  reports: acc.reports || group.rights.reports,
});

const resolveRights = (groups: Group[], admin: boolean): Rights => {
  if (admin) return { fileTypes: [...FILE_TYPES], reports: true, admin: true };
  return { ...groups.reduce(unionOf, NOTHING), admin: false };
};

export { resolveRights };
