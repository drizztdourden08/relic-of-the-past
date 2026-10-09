/* @layer hub-core @kind logic */
import { HUB_ROUTES, isProvider } from '../../../shared/hub';
import { badRequest, conflict, notFound } from '../http/http-error';
import { requireSession } from '../auth/require-session';
import { refreshAccess } from '../access/refresh-access';
import { identitiesRepo } from '../db/identities-repo';
import type { SiteConfig } from '../site-config.type';
import type { Route } from '../route.type';

const meUnlink = (site: SiteConfig): Route => ({
  ...HUB_ROUTES.meUnlink,
  handler: async ({ req, res, params }) => {
    const { userId } = await requireSession(req);
    if (!isProvider(params.provider)) throw badRequest('Unknown sign-in provider.');
    const identities = await identitiesRepo.forUser(userId);
    const target = identities.find((identity) => identity.provider === params.provider);
    if (!target) throw notFound('That provider is not linked.');
    if (identities.length <= 1) throw conflict('The last sign-in method cannot be unlinked.');
    await identitiesRepo.remove(target.id);
    const user = await refreshAccess(site, userId, null);
    res.status(200).json({ identities: identities.filter((identity) => identity.id !== target.id), access: user.sites[site.id] ?? null });
  },
});

export { meUnlink };
