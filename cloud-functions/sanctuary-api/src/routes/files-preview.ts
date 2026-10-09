/* @layer root-config @kind logic */
import { LIMITS, SANCTUARY_ROUTES } from '@rotp/hub-contracts';
import { conflict } from '@rotp/hub-server';
import { queryParam } from '@rotp/hub-server';
import { requireMember } from '@rotp/hub-server';
import { loadVisibleFile } from '../files/file-guards';
import { currentVersionOf, loadVersion } from '../files/versions';
import { filesBucket } from '../storage/files-bucket';
import type { Route } from '@rotp/hub-server';
import { SANCTUARY_SITE } from '../site';

const filesPreview: Route = {
  ...SANCTUARY_ROUTES.filesPreview,
  handler: async ({ req, res, params }) => {
    const member = await requireMember(req, SANCTUARY_SITE);
    const file = await loadVisibleFile(params.id, member);
    const asked = queryParam(req, 'v');
    const version = asked === undefined ? currentVersionOf(file) : loadVersion(file, asked);
    if (version.status !== 'ready') throw conflict('This version is still uploading.');
    const url = await filesBucket.signPreview(version.key, version.contentType);
    res.status(200).json({ url, contentType: version.contentType, expiresInSeconds: LIMITS.previewUrlSeconds });
  },
};

export { filesPreview };
