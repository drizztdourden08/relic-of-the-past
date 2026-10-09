/* @layer root-config @kind data */
import type { Route } from '../../hub-core/route.type';
import { filesList } from './routes/files-list';
import { filesBegin } from './routes/files-begin';
import { filesSignParts } from './routes/files-sign-parts';
import { filesParts } from './routes/files-parts';
import { filesComplete } from './routes/files-complete';
import { filesPatch } from './routes/files-patch';
import { filesDownload } from './routes/files-download';
import { filesPreview } from './routes/files-preview';
import { filesDelete } from './routes/files-delete';
import { fileVersionsBegin } from './routes/file-versions-begin';
import { fileVersionsSignParts } from './routes/file-versions-sign-parts';
import { fileVersionsParts } from './routes/file-versions-parts';
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
  filesParts,
  filesComplete,
  filesPatch,
  filesDownload,
  filesPreview,
  filesDelete,
  fileVersionsBegin,
  fileVersionsSignParts,
  fileVersionsParts,
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
