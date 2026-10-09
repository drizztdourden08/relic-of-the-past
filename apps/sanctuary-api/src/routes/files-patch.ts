/* @layer root-config @kind logic */
import { SANCTUARY_ROUTES, patchFileSchema } from '@rotp/hub-contracts';
import { parseBody } from '@rotp/hub-server';
import { requireMember } from '@rotp/hub-server';
import { assertOwnerOrAdmin, assertVisibleType, loadVisibleFile } from '../files/file-guards';
import { filesRepo } from '../db/files-repo';
import type { Route } from '@rotp/hub-server';
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
