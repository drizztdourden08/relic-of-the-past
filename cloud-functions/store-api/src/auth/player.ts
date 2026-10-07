/* @layer store-api @kind logic */
/** The store's guards over hub-core's. A player is anyone signed in and not banned from the
 *  store; the first call writes their store record. A permission the caller lacks answers as
 *  missing, the way an unseen Sanctuary shelf does. */
import type { Request } from '@google-cloud/functions-framework';
import { hasRight } from '../../../../shared/hub/rights';
import type { StorePermission } from '../../../../shared/store/store-permissions';
import type { Person } from '../../../../shared/store/types';
import { notFound } from '../../../hub-core/http/http-error';
import { requireMember } from '../../../hub-core/auth/require-member';
import type { Member } from '../../../hub-core/auth/require-member';
import { requireAdmin } from '../../../hub-core/auth/require-admin';
import { STORE_SITE } from '../site';

type Player = Member;

const requirePlayer = (req: Request): Promise<Player> => requireMember(req, STORE_SITE);

const requirePermission = async (req: Request, permission: StorePermission): Promise<Player> => {
  const player = await requirePlayer(req);
  if (!hasRight(player.rights, permission)) throw notFound();
  return player;
};

const requireStoreAdmin = (req: Request): Promise<Player> => requireAdmin(req, STORE_SITE);

const personOf = ({ caller, user }: Player): Person => ({ userId: caller.userId, displayName: user.displayName });

export { requirePlayer, requirePermission, requireStoreAdmin, personOf };
export type { Player };
