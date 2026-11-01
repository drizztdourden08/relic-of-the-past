/* @layer store-api @kind logic */
import { conflict } from '@rotp/hub-server';
import { requirePlayer } from '../../auth/player';
import { loadOwnItem } from '../item-guards';
import { loadVersion } from '../versions';
import type { UploadingVersion, VersionRouteContext } from './version-routes.type';

const loadUploadingVersion = async ({ req, params }: VersionRouteContext): Promise<UploadingVersion> => {
  const player = await requirePlayer(req);
  const item = await loadOwnItem(params.id, player);
  const version = loadVersion(item, params.n);
  if (version.review.state !== 'uploading' || !version.upload) throw conflict('This version is not being uploaded.');
  return { player, item, version, upload: version.upload };
};

export { loadUploadingVersion };
