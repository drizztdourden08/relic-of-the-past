/* @layer hub-core @kind types */
import type { AccessPolicy, GroupRights, RightsModel, SiteId } from '../../shared/hub';

type DefaultGroupSeed = {
  name: string;
  rights: GroupRights;
};

type SiteConfig = {
  id: SiteId;
  origin: () => string;
  access: AccessPolicy;
  rights: RightsModel;
  viewSurfaces: readonly string[];
  defaultGroup: DefaultGroupSeed | null;
};

export type { SiteConfig, DefaultGroupSeed };
