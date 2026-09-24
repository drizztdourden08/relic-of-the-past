/* @layer sanctuary-site @kind types */
/**
 * Response shapes of the routes the site calls. The request bodies come from
 * shared/sanctuary/schemas; the answers are not in shared yet, so this file is the one
 * place to align when the API's responses land there.
 */
import type { SanctuaryUser, Identity, AccessCheck, SavedView } from '@shared/sanctuary/types';
import type { Device } from '@shared/sanctuary/device-types';
import type { SanctuaryFile } from '@shared/sanctuary/file-types';
import type { Report, ReportReporter } from '@shared/sanctuary/report-types';

/** GET /me */
type MeResponse = {
  user: SanctuaryUser;
  identities: Identity[];
};

/** POST /me/recheck */
type RecheckResponse = {
  access: AccessCheck;
};

/** GET /devices */
type DevicesResponse = {
  devices: Device[];
};

/** POST /device/confirm */
type DeviceConfirmResponse = {
  device: Pick<Device, 'id' | 'label' | 'platform'>;
};

/** One row of the admin queue: a user with the identities that name them. */
type AdminUser = {
  user: SanctuaryUser;
  identities: Identity[];
};

/** GET /admin/pending: every user, grouped by the site into pending, members, revoked. */
type AdminQueueResponse = {
  users: AdminUser[];
};

/** GET /files, with or without `type`; without it, every ready file up to one page. */
type FilesListResponse = {
  files: SanctuaryFile[];
  nextCursor: string | null;
};

/** POST /files */
type FileBeginResponse = {
  fileId: string;
  uploadId: string;
  partSize: number;
  parts: number;
};

/** POST /files/:id/parts */
type SignPartsResponse = {
  urls: { part: number; url: string }[];
};

/** POST /files/:id/complete and PATCH /files/:id both answer with the record. */
type FileResponse = {
  file: SanctuaryFile;
};

/** POST /files/:id/download and POST /reports/:id/download */
type DownloadResponse = {
  url: string;
  expiresInSeconds: number;
};

/** GET /me/views?surface */
type ViewsListResponse = {
  views: SavedView[];
};

/** A reporter as the API returns it: the stored pair plus the GitHub login when one is linked. */
type ReportReporterView = ReportReporter & { githubHandle?: string | null };

/** A report as the API returns it. */
type ReportView = Omit<Report, 'reporter'> & { reporter: ReportReporterView | null };

/** GET /reports */
type ReportsListResponse = {
  reports: ReportView[];
  nextCursor: string | null;
};

/** POST /reports/:id/extend */
type ReportResponse = {
  report: ReportView;
};

export type {
  MeResponse,
  RecheckResponse,
  DevicesResponse,
  DeviceConfirmResponse,
  AdminUser,
  AdminQueueResponse,
  FilesListResponse,
  FileBeginResponse,
  SignPartsResponse,
  FileResponse,
  DownloadResponse,
  ViewsListResponse,
  ReportReporterView,
  ReportView,
  ReportsListResponse,
  ReportResponse,
};
