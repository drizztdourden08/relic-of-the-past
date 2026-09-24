/* @layer root-config @kind logic */
/** POST /me/unlink/:provider. Removes one identity and re-runs the access
 *  chain, since the removed one may have been what granted access. The last
 *  identity stays, or the account would have no way back in. */
import { SANCTUARY_ROUTES, isProvider } from '../../../../shared/sanctuary';
import { badRequest, conflict, notFound } from '../http/http-error';
import { requireSession } from '../auth/require-session';
import { evaluateAccess } from '../access/evaluate-access';
import { identitiesRepo } from '../db/identities-repo';
import { usersRepo } from '../db/users-repo';
import type { Route } from '../route.type';

const meUnlink: Route = {
  ...SANCTUARY_ROUTES.meUnlink,
  handler: async ({ req, res, params }) => {
    const { userId } = await requireSession(req);
    if (!isProvider(params.provider)) throw badRequest('Unknown sign-in provider.');
    const identities = await identitiesRepo.forUser(userId);
    const target = identities.find((identity) => identity.provider === params.provider);
    if (!target) throw notFound('That provider is not linked.');
    if (identities.length <= 1) throw conflict('The last sign-in method cannot be unlinked.');
    await identitiesRepo.remove(target.id);
    const access = await evaluateAccess(userId, null);
    await usersRepo.setAccess(userId, access);
    res.status(200).json({ identities: identities.filter((identity) => identity.id !== target.id), access });
  },
};

export { meUnlink };
