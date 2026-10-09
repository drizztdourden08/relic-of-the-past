/* @layer hub-core @kind logic */
import type { HubUser } from '../../../shared/hub';
import { notFound } from '../http/http-error';
import { usersRepo } from '../db/users-repo';
import type { SiteConfig } from '../site-config.type';
import type { FreshToken } from './access-rule.type';
import { siteAccess } from './site-access';

const refreshAccess = async (site: SiteConfig, userId: string, fresh: FreshToken | null): Promise<HubUser> => {
  const user = await usersRepo.get(userId);
  if (!user) throw notFound('No such user.');
  const { access, roleGroupIds } = await siteAccess(site, user, fresh);
  await usersRepo.saveSiteAccess(user.id, site.id, access, roleGroupIds);
  return { ...user, sites: { ...user.sites, [site.id]: access }, roleGroupIds };
};

export { refreshAccess };
