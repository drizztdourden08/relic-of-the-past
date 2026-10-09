/* @layer hub-core @kind logic */
import type { Group, Rights, RightsModel } from '../../../shared/hub';

const resolveRights = (model: RightsModel, groups: Group[], admin: boolean): Rights => {
  const permissions = admin ? [...model.all] : groups.flatMap((group) => group.rights[model.site] ?? []);
  return { site: model.site, permissions: Array.from(new Set(permissions)), admin };
};

export { resolveRights };
