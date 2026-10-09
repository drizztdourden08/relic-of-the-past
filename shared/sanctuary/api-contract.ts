/* @layer shared-sanctuary @kind data */
import type { RouteDef } from '../hub/api-contract';

const SANCTUARY_ROUTES = {
  filesList: { method: 'GET', path: '/files' },
  filesCreate: { method: 'POST', path: '/files' },
  filesSignParts: { method: 'POST', path: '/files/:id/parts' },
  filesParts: { method: 'GET', path: '/files/:id/parts' },
  filesComplete: { method: 'POST', path: '/files/:id/complete' },
  fileVersionsBegin: { method: 'POST', path: '/files/:id/versions' },
  fileVersionsSignParts: { method: 'POST', path: '/files/:id/versions/:n/parts' },
  fileVersionsParts: { method: 'GET', path: '/files/:id/versions/:n/parts' },
  fileVersionsComplete: { method: 'POST', path: '/files/:id/versions/:n/complete' },
  fileVersionsRestore: { method: 'POST', path: '/files/:id/versions/:n/restore' },
  fileVersionsDownload: { method: 'POST', path: '/files/:id/versions/:n/download' },
  fileVersionsDelete: { method: 'DELETE', path: '/files/:id/versions/:n' },
  filesPreview: { method: 'POST', path: '/files/:id/preview' },
  filesDownload: { method: 'POST', path: '/files/:id/download' },
  filesPatch: { method: 'PATCH', path: '/files/:id' },
  filesDelete: { method: 'DELETE', path: '/files/:id' },

  adminSweep: { method: 'POST', path: '/admin/sweep' },

  reportsCreate: { method: 'POST', path: '/reports' },
  reportsComplete: { method: 'POST', path: '/reports/:id/complete' },
  reportsList: { method: 'GET', path: '/reports' },
  reportsGet: { method: 'GET', path: '/reports/:id' },
  reportsDownload: { method: 'POST', path: '/reports/:id/download' },
  reportsExtend: { method: 'POST', path: '/reports/:id/extend' },
  reportsDelete: { method: 'DELETE', path: '/reports/:id' },
} as const satisfies Record<string, RouteDef>;

export { SANCTUARY_ROUTES };
