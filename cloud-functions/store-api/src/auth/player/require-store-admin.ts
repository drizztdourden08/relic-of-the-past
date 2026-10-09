/* @layer store-api @kind logic */
import type { Request } from '@google-cloud/functions-framework';
import { requireAdmin } from '@rotp/hub-server';
import { STORE_SITE } from '../../site.constants';
import type { Player } from './player.type';

const requireStoreAdmin = (req: Request): Promise<Player> => requireAdmin(req, STORE_SITE);

export { requireStoreAdmin };
