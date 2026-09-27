/* @layer root-config @kind logic */
/** The Sanctuary's own routes, one file each: files, versions, reports and the sweep. The
 *  account routes come first from hub-core. Order matters only where two patterns could
 *  match the same path; none do here. */
import type { Route } from '../../hub-core/route.type';
import { filesList } from './routes/files-list';
import { filesBegin } from './routes/files-begin';
import { filesSignParts } from './routes/files-sign-parts';
import { filesComplete } from './routes/files-complete';
import { filesPatch } from './routes/files-patch';
import { filesDownload } from './routes/files-download';
import { filesPreview } from './routes/files-preview';
import { filesDelete } from './routes/files-delete';
import { fileVersionsBegin } from './routes/file-versions-begin';
import { fileVersionsSignParts } from './routes/file-versions-sign-parts';
import { fileVersionsComplete } from './routes/file-versions-complete';
import { fileVersionsRestore } from './routes/file-versions-restore';
import { fileVersionsDownload } from './routes/file-versions-download';
import { fileVersionsDelete } from './routes/file-versions-delete';
import { adminSweep } from './routes/admin-sweep';
import { reportsCreate } from './routes/reports-create';
import { reportsComplete } from './routes/reports-complete';
import { reportsList } from './routes/reports-list';
import { reportsGet } from './routes/reports-get';
import { reportsDownload } from './routes/reports-download';
import { reportsExtend } from './routes/reports-extend';
import { reportsDelete } from './routes/reports-delete';

const ROUTES: Route[] = [
  filesList,
  filesBegin,
  filesSignParts,
  filesComplete,
  filesPatch,
  filesDownload,
  filesPreview,
  filesDelete,
  fileVersionsBegin,
  fileVersionsSignParts,
  fileVersionsComplete,
  fileVersionsRestore,
  fileVersionsDownload,
  fileVersionsDelete,
  adminSweep,
  reportsCreate,
  reportsComplete,
  reportsList,
  reportsGet,
  reportsDownload,
  reportsExtend,
  reportsDelete,
];

export { ROUTES };
