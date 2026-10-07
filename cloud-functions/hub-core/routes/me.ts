/* @layer hub-core @kind logic */
/** GET /me. The site's first call and the app's identity check: the user, the
 *  linked identities, the access state on this site, and the caller's groups and
 *  rights so the site can hide what the API would refuse, by either credential. */
import { HUB_ROUTES } from '../../../shared/hub';
import { unauthorized } from '../http/http-error';
import { requireCaller } from '../auth/require-caller';
import { callerRights } from '../access/caller-rights';
import { siteUserOf } from '../access/site-user';
import { withSiteRecord } from '../access/with-site-record';
import { usersRepo } from '../db/users-repo';
import { identitiesRepo } from '../db/identities-repo';
import type { SiteConfig } from '../site-config.type';
import type { Route } from '../route.type';

const me = (site: SiteConfig): Route => ({
  ...HUB_ROUTES.me,
  handler: async ({ req, res }) => {
    const caller = await requireCaller(req);
    const [stored, identities] = await Promise.all([usersRepo.get(caller.userId), identitiesRepo.forUser(caller.userId)]);
    if (!stored) throw unauthorized();
    const user = await withSiteRecord(site, stored);
    const { groups, rights } = await callerRights(user, site);
    res.status(200).json({ user: siteUserOf(user, site), identities, groups, rights, via: caller.via, deviceId: caller.deviceId });
  },
});

export { me };
