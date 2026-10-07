/* @layer hub-core @kind logic */
/** A caller's rights on one site: the union of their groups' permissions for that site, or
 *  every permission of the site's model for an admin. Routes ask the Rights value, never
 *  the groups. */
import type { Group, Rights, RightsModel } from '../../../shared/hub';

const resolveRights = (model: RightsModel, groups: Group[], admin: boolean): Rights => {
  const permissions = admin ? [...model.all] : groups.flatMap((group) => group.rights[model.site] ?? []);
  return { site: model.site, permissions: Array.from(new Set(permissions)), admin };
};

export { resolveRights };
