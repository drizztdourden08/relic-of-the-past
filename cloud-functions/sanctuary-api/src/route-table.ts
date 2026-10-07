/* @layer root-config @kind logic */
/** Every route the function serves, one file each. Order matters only where
 *  two patterns could match the same path; none do here. */
import type { Route } from './route.type';
import { authStart } from './routes/auth-start';
import { authCallback } from './routes/auth-callback';
import { authSignOut } from './routes/auth-signout';
import { me } from './routes/me';
import { meRecheck } from './routes/me-recheck';
import { meUnlink } from './routes/me-unlink';
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
import { viewsList } from './routes/views-list';
import { viewsPut } from './routes/views-put';
import { viewsDelete } from './routes/views-delete';
import { adminPending } from './routes/admin-pending';
import { adminSetGroups } from './routes/admin-set-groups';
import { groupsList } from './routes/groups-list';
import { discordRoles } from './routes/discord-roles';
import { groupsCreate } from './routes/groups-create';
import { groupsPatch } from './routes/groups-patch';
import { groupsDelete } from './routes/groups-delete';
import { adminRevoke } from './routes/admin-revoke';
import { adminSweep } from './routes/admin-sweep';
import { deviceBegin } from './routes/device-begin';
import { deviceConfirm } from './routes/device-confirm';
import { devicePoll } from './routes/device-poll';
import { devicesList } from './routes/devices-list';
import { devicesRevoke } from './routes/devices-revoke';
import { reportsCreate } from './routes/reports-create';
import { reportsComplete } from './routes/reports-complete';
import { reportsList } from './routes/reports-list';
import { reportsGet } from './routes/reports-get';
import { reportsDownload } from './routes/reports-download';
import { reportsExtend } from './routes/reports-extend';
import { reportsDelete } from './routes/reports-delete';

const ROUTES: Route[] = [
  authStart,
  authCallback,
  authSignOut,
  me,
  meRecheck,
  meUnlink,
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
  viewsList,
  viewsPut,
  viewsDelete,
  adminPending,
  adminSetGroups,
  groupsList,
  discordRoles,
  groupsCreate,
  groupsPatch,
  groupsDelete,
  adminRevoke,
  adminSweep,
  deviceBegin,
  deviceConfirm,
  devicePoll,
  devicesList,
  devicesRevoke,
  reportsCreate,
  reportsComplete,
  reportsList,
  reportsGet,
  reportsDownload,
  reportsExtend,
  reportsDelete,
];

export { ROUTES };
