/* @layer root-config @kind logic */
/** GET /files?type&cursor. Ready files of the types the caller can see, newest
 *  first, in pages of 200; `type` narrows to one type and is optional (the rail
 *  counts need every type at once). A type the caller cannot see lists empty.
 *  Search, clauses, sort and grouping run in the browser. */
import { FILE_TYPES, SANCTUARY_ROUTES, fileTypeSchema } from '../../../../shared/sanctuary';
import type { FileType, Rights } from '../../../../shared/sanctuary';
import { badRequest } from '../http/http-error';
import { queryParam } from '../http/query';
import { requireAccess } from '../auth/require-access';
import { canSeeType } from '../access/can-see';
import { filesRepo } from '../db/files-repo';
import type { Route } from '../route.type';

const PAGE_SIZE = 200;

/** null asks for every type; an empty list means nothing to show. */
const typesToList = (requested: FileType | null, rights: Rights): FileType[] | null => {
  if (requested) return canSeeType(rights, requested) ? [requested] : [];
  const visible = FILE_TYPES.filter((type) => canSeeType(rights, type));
  return visible.length === FILE_TYPES.length ? null : visible;
};

const filesList: Route = {
  ...SANCTUARY_ROUTES.filesList,
  handler: async ({ req, res }) => {
    const { rights } = await requireAccess(req);
    const rawType = queryParam(req, 'type');
    const type = rawType === undefined ? null : fileTypeSchema.safeParse(rawType);
    if (type && !type.success) throw badRequest('Pick a file type.');
    const types = typesToList(type ? type.data : null, rights);
    if (types?.length === 0) {
      res.status(200).json({ files: [], nextCursor: null });
      return;
    }
    const { items, nextCursor } = await filesRepo.listReady(types, queryParam(req, 'cursor'), PAGE_SIZE);
    res.status(200).json({ files: items, nextCursor });
  },
};

export { filesList };
