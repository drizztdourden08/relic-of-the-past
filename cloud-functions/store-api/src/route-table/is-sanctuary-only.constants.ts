/* @layer store-api @kind constants */
import { HUB_ROUTES } from '../../../../shared/hub/api-contract';
import type { RouteDef } from '../../../../shared/hub/api-contract';

const SANCTUARY_ONLY: readonly RouteDef[] = [
  HUB_ROUTES.adminPending,
  HUB_ROUTES.adminSetGroups,
  HUB_ROUTES.adminRevoke,
  HUB_ROUTES.groupsList,
  HUB_ROUTES.discordRoles,
  HUB_ROUTES.groupsCreate,
  HUB_ROUTES.groupsPatch,
  HUB_ROUTES.groupsDelete,
];

export { SANCTUARY_ONLY };
