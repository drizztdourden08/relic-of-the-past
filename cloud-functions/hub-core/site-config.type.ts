/* @layer hub-core @kind types */
/** One site standing on the shared accounts, as its function describes it to the kit. The
 *  account routes, the guards and the access check read only this, so a second site is a
 *  second config. The origin is a getter so the environment is read at the first request,
 *  never at import. */
import type { AccessPolicy, GroupRights, RightsModel, SiteId } from '../../shared/hub';

type DefaultGroupSeed = {
  name: string;
  rights: GroupRights;
};

type SiteConfig = {
  id: SiteId;
  /** The site's own origin: the Origin check, the OAuth callbacks and the device page. */
  origin: () => string;
  access: AccessPolicy;
  rights: RightsModel;
  /** The saved-view surfaces this site's pages keep; any other name is refused. */
  viewSurfaces: readonly string[];
  /** Written by the first read that misses the default group, on the site that owns it. */
  defaultGroup: DefaultGroupSeed | null;
};

export type { SiteConfig, DefaultGroupSeed };
