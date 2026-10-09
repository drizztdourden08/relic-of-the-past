/* @layer shared-sanctuary @kind types */
import type { ControllerReportPayload } from '../../types/github-issue';

type ReportKind = 'player' | 'controller';

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
  id: string;
  kind: ReportKind;
  subject: string;
  reporter: ReportReporter | null;
  contactEmail: string | null;
  appVersion: string;
  platform: string;
  screenId: string | null;
  issue: ReportIssue;
  zip: ReportZip | null;
  legacy: boolean;
  createdAt: number;
  expiresAt: number | null;
  extendedUntil: number | null;
};

type ReportContext = { appVersion: string; platform: string; screenId: string | null };

type SubmitReportRequest = {
  kind: ReportKind;
  subject: string;
  description: string;
  debugInfo: string;
  context: ReportContext;
  contactEmail: string | null;
  attachment: ReportZip | null;
  controllerReport?: ControllerReportPayload;
};

type SubmitReportResult = {
  reportId: string;
  issueUrl: string;
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
