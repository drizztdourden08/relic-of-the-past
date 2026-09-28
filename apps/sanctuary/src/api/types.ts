/* @layer sanctuary-site @kind types */
/**
 * Response shapes of the Sanctuary's own routes: files, versions and reports. The request
 * bodies come from shared/sanctuary/schemas; the account answers are the kit's.
 */
import type { SanctuaryFile } from '@shared/sanctuary/file-types';
import type { Report, ReportReporter } from '@shared/sanctuary/report-types';
import type { SignedParts } from '@shared/hub/upload/run-multipart';
import type { UploadedParts } from '@shared/hub/upload/uploaded-part.type';

/** POST /files/:id/versions */
type VersionBeginResponse = {
  fileId: string;
  n: number;
  uploadId: string;
  partSize: number;
  parts: number;
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
type SignPartsResponse = SignedParts;

/** GET /files/:id/parts and GET /files/:id/versions/:n/parts: what a resumed upload already has up. */
type UploadedPartsResponse = UploadedParts;

/** POST /files/:id/complete and PATCH /files/:id both answer with the record. */
type FileResponse = {
  file: SanctuaryFile;
};

/** POST /files/:id/download and POST /reports/:id/download */
type DownloadResponse = {
  url: string;
  expiresInSeconds: number;
};

/** POST /files/:id/preview: a link the browser shows inline, in an img or a video. */
type PreviewResponse = {
  url: string;
  contentType: string;
  expiresInSeconds: number;
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
  VersionBeginResponse,
  FilesListResponse,
  FileBeginResponse,
  SignPartsResponse,
  UploadedPartsResponse,
  FileResponse,
  DownloadResponse,
  PreviewResponse,
  ReportReporterView,
  ReportView,
  ReportsListResponse,
  ReportResponse,
};
