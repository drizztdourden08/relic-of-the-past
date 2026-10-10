/* @layer sanctuary-site @kind types */
import type { ReportView } from '../../endpoints/api-responses.type';

type ReportRow = Pick<ReportView, 'id' | 'subject' | 'kind' | 'issue' | 'appVersion' | 'platform' | 'screenId' | 'legacy'> & {
  reporter: { displayName: string; githubHandle: string | null };
  zip: { bytes: number } | null;
  size: string;
  contents: string;
  createdAt: string;
  expiresAt: string | null;
  extendedUntil: string | null;
};

export type { ReportRow };
