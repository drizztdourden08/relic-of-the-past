/* @layer root-config @kind logic */
/** GET /files?type&cursor. Ready files, newest first, in pages of 200; `type`
 *  narrows to one type and is optional (the rail counts need every type at once).
 *  Search, clauses, sort and grouping run in the browser. */
import { SANCTUARY_ROUTES, fileTypeSchema } from '../../../../shared/sanctuary';
import { badRequest } from '../http/http-error';
import { queryParam } from '../http/query';
import { requireAccess } from '../auth/require-access';
import { filesRepo } from '../db/files-repo';
import type { Route } from '../route.type';

const PAGE_SIZE = 200;

const filesList: Route = {
  ...SANCTUARY_ROUTES.filesList,
  handler: async ({ req, res }) => {
    await requireAccess(req);
    const rawType = queryParam(req, 'type');
    const type = rawType === undefined ? null : fileTypeSchema.safeParse(rawType);
    if (type && !type.success) throw badRequest('Pick a file type.');
    const { items, nextCursor } = await filesRepo.listReady(type ? type.data : null, queryParam(req, 'cursor'), PAGE_SIZE);
    res.status(200).json({ files: items, nextCursor });
  },
};

export { filesList };
