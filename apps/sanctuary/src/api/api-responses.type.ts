/* @layer sanctuary-site @kind types */
import type { SanctuaryFile } from '@shared/sanctuary/file-types';
import type { Report, ReportReporter } from '@shared/sanctuary/report-types';
import type { SignedParts } from '@shared/hub/upload/run-multipart';
import type { UploadedParts } from '@shared/hub/upload/uploaded-part.type';

type VersionBeginResponse = {
  fileId: string;
  n: number;
  uploadId: string;
  partSize: number;
  parts: number;
};

type FilesListResponse = {
  files: SanctuaryFile[];
  nextCursor: string | null;
};

type FileBeginResponse = {
  fileId: string;
  uploadId: string;
  partSize: number;
  parts: number;
};

type SignPartsResponse = SignedParts;

type UploadedPartsResponse = UploadedParts;

type FileResponse = {
  file: SanctuaryFile;
};

type DownloadResponse = {
  url: string;
  expiresInSeconds: number;
};

type PreviewResponse = {
  url: string;
  contentType: string;
  expiresInSeconds: number;
};

type ReportReporterView = ReportReporter & { githubHandle?: string | null };

type ReportView = Omit<Report, 'reporter'> & { reporter: ReportReporterView | null };

type ReportsListResponse = {
  reports: ReportView[];
  nextCursor: string | null;
};

type ReportResponse = {
  report: ReportView;
};

type OkResponse = { ok: true };

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
  OkResponse,
};
