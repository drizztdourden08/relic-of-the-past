/* @layer shared-sanctuary @kind data */
/**
 * The Sanctuary's own routes: files, their versions, reports and the report sweep. The
 * account routes it also serves are HUB_ROUTES in shared/hub.
 */
import { route } from '../hub/api-contract';
import type { RouteDef } from '../hub/api-contract';

const SANCTUARY_ROUTES = {
  filesList: route('GET', '/files'),
  filesCreate: route('POST', '/files'),
  filesSignParts: route('POST', '/files/:id/parts'),
  filesComplete: route('POST', '/files/:id/complete'),
  fileVersionsBegin: route('POST', '/files/:id/versions'),
  fileVersionsSignParts: route('POST', '/files/:id/versions/:n/parts'),
  fileVersionsComplete: route('POST', '/files/:id/versions/:n/complete'),
  fileVersionsRestore: route('POST', '/files/:id/versions/:n/restore'),
  fileVersionsDownload: route('POST', '/files/:id/versions/:n/download'),
  fileVersionsDelete: route('DELETE', '/files/:id/versions/:n'),
  filesPreview: route('POST', '/files/:id/preview'),
  filesDownload: route('POST', '/files/:id/download'),
  filesPatch: route('PATCH', '/files/:id'),
  filesDelete: route('DELETE', '/files/:id'),

  adminSweep: route('POST', '/admin/sweep'),

  reportsCreate: route('POST', '/reports'),
  reportsComplete: route('POST', '/reports/:id/complete'),
  reportsList: route('GET', '/reports'),
  reportsGet: route('GET', '/reports/:id'),
  reportsDownload: route('POST', '/reports/:id/download'),
  reportsExtend: route('POST', '/reports/:id/extend'),
  reportsDelete: route('DELETE', '/reports/:id'),
} as const satisfies Record<string, RouteDef>;

type SanctuaryRoute = keyof typeof SANCTUARY_ROUTES;

export { SANCTUARY_ROUTES };
export type { SanctuaryRoute };
