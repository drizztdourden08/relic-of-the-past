/* @layer root-config @kind logic */
/**
 * POST /files/:id/preview?v=<n>. A short-lived link that shows the file in the browser
 * (the image viewer, the video player) instead of saving it. The current version unless
 * `v` names another. Viewing is not a download, so the counter stays as it is.
 */
import { LIMITS, SANCTUARY_ROUTES } from '../../../../shared/sanctuary';
import { conflict } from '../../../hub-core/http/http-error';
import { queryParam } from '../../../hub-core/http/query';
import { requireMember } from '../../../hub-core/auth/require-member';
import { loadVisibleFile } from '../files/file-guards';
import { currentVersionOf, loadVersion } from '../files/versions';
import { filesBucket } from '../storage/files-bucket';
import type { Route } from '../../../hub-core/route.type';
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
