/* @layer shared-sanctuary @kind types */
/**
 * Bug reports filed from the app: the stored record, the request the app submits and what
 * the API answers. A report is a GitHub issue plus an optional zip in the bucket.
 */
import type { ControllerReportPayload } from '../types/github-issue';

type ReportKind = 'player' | 'controller';

/** Counts from the zip manifest, for the row. */
type ReportContents = { saves: number; captureSessions: number; logs: number };

type ReportReporter = { userId: string; displayName: string };

type ReportIssue = {
  number: number;
  url: string;
  state: 'open' | 'closed';
  closedAt: number | null;
};

type ReportZip = { bytes: number; contents: ReportContents };

type Report = {
  /** The app's 12-char id, unchanged, so old issue bodies still resolve. */
  id: string;
  kind: ReportKind;
  subject: string;
  /** null = anonymous. */
  reporter: ReportReporter | null;
  /** Anonymous reports only; visible to admins only. */
  contactEmail: string | null;
  appVersion: string;
  platform: string;
  /** Game screen id at submit time, when the game was running. */
  screenId: string | null;
  issue: ReportIssue;
  /** null until complete, or when nothing was attached. */
  zip: ReportZip | null;
  /** Migrated from the old bucket. */
  legacy: boolean;
  createdAt: number;
  /** Set by the sweep once the issue closes. */
  expiresAt: number | null;
  /** Extend button: +30 days per click, at most a year past the close; the sweep honours the later of the two. */
  extendedUntil: number | null;
};

type ReportContext = { appVersion: string; platform: string; screenId: string | null };

type SubmitReportRequest = {
  kind: ReportKind;
  subject: string;
  description: string;
  debugInfo: string;
  context: ReportContext;
  /** Required by the API when no caller identity is present. */
  contactEmail: string | null;
  attachment: ReportZip | null;
  controllerReport?: ControllerReportPayload;
};

type SubmitReportResult = {
  reportId: string;
  issueUrl: string;
  /** Presigned PUT for the zip, present when an attachment was declared. */
  uploadUrl: string | null;
};

export type {
  ReportKind,
  ReportContents,
  ReportReporter,
  ReportIssue,
  ReportZip,
  Report,
  ReportContext,
  SubmitReportRequest,
  SubmitReportResult,
};
