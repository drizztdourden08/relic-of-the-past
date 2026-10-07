/* @layer store-api @kind logic */
/** GET /authors/:userId. The public author page: name, avatar, when they came to the store,
 *  their published items and the totals across them. Nothing unpublished shows. */
import { STORE_ROUTES } from '../../../../shared/store/api-contract';
import type { AuthorResponse } from '../../../../shared/store/api-types';
import { notFound } from '../../../hub-core/http/http-error';
import { usersRepo } from '../../../hub-core/db/users-repo';
import type { Route } from '../../../hub-core/route.type';
import { requirePlayer } from '../auth/player';
import { itemsRepo } from '../db/items-repo';
import { toCardView } from '../items/card-view';
import { signCards } from '../media/sign-media';

const authorsGet: Route = {
  ...STORE_ROUTES.authorsGet,
  handler: async ({ req, res, params }) => {
    await requirePlayer(req);
    const user = await usersRepo.get(params.userId);
    if (!user) throw notFound('No such author.');
    const published = (await itemsRepo.byAuthor(user.id)).filter((item) => item.status === 'published');
    const ratingCount = published.reduce((sum, item) => sum + item.stats.ratingCount, 0);
    const ratingSum = published.reduce((sum, item) => sum + item.stats.ratingSum, 0);
    const body: AuthorResponse = {
      author: {
        userId: user.id,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        joinedAt: user.sites.store?.firstSeenAt ?? user.createdAt,
        installs: published.reduce((sum, item) => sum + item.stats.installs, 0),
        ratingCount,
        ratingAverage: ratingCount > 0 ? ratingSum / ratingCount : null,
      },
      items: await signCards(published.map(toCardView)),
    };
    res.status(200).json(body);
  },
};

export { authorsGet };
