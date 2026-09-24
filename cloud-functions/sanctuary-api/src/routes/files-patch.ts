/* @layer root-config @kind logic */
/** PATCH /files/:id. Type, tags, version and note, inline from the detail pane. */
import { SANCTUARY_ROUTES, patchFileSchema } from '../../../../shared/sanctuary';
import { parseBody } from '../http/parse-body';
import { requireAccess } from '../auth/require-access';
import { assertOwnerOrAdmin, loadFile } from '../files/file-guards';
import { filesRepo } from '../db/files-repo';
import type { Route } from '../route.type';

const filesPatch: Route = {
  ...SANCTUARY_ROUTES.filesPatch,
  handler: async ({ req, res, params }) => {
    const member = await requireAccess(req);
    const file = await loadFile(params.id);
    assertOwnerOrAdmin(file, member);
    const patch = parseBody(patchFileSchema, req.body);
    await filesRepo.update(file.id, patch);
    res.status(200).json({ file: { ...file, ...patch } });
  },
};

export { filesPatch };
