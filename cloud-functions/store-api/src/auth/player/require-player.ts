/* @layer store-api @kind logic */
import type { Request } from '@google-cloud/functions-framework';
import { requireMember } from '../../../../hub-core/auth/require-member';
import { STORE_SITE } from '../../site.constants';
import type { Player } from './player.type';

const requirePlayer = (req: Request): Promise<Player> => requireMember(req, STORE_SITE);

export { requirePlayer };
