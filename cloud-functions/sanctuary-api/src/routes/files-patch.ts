/* @layer root-config @kind logic */
/** PATCH /files/:id. Type, tags, version and note, inline from the detail pane.
 *  Moving a file to a type the caller cannot see is refused. */
import { SANCTUARY_ROUTES, patchFileSchema } from '../../../../shared/sanctuary';
import { parseBody } from '../../../hub-core/http/parse-body';
import { requireMember } from '../../../hub-core/auth/require-member';
import { assertOwnerOrAdmin, assertVisibleType, loadVisibleFile } from '../files/file-guards';
import { filesRepo } from '../db/files-repo';
import type { Route } from '../../../hub-core/route.type';
import { SANCTUARY_SITE } from '../site';

const filesPatch: Route = {
  ...SANCTUARY_ROUTES.filesPatch,
  handler: async ({ req, res, params }) => {
    const member = await requireMember(req, SANCTUARY_SITE);
    const file = await loadVisibleFile(params.id, member);
    assertOwnerOrAdmin(file, member);
    const patch = parseBody(patchFileSchema, req.body);
    if (patch.type) assertVisibleType(patch.type, member);
    await filesRepo.update(file.id, patch);
    res.status(200).json({ file: { ...file, ...patch } });
  },
};

export { filesPatch };
