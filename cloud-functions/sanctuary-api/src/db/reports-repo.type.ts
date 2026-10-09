/* @layer root-config @kind types */
import type { Report } from '../../../../shared/sanctuary';

type ReportPage = { items: Report[]; nextCursor: string | null };
type ReportFilter = { mineUserId: string | null; state: Report['issue']['state'] | null; cursor: string | undefined };
type ReportPatch = Partial<Pick<Report, 'zip' | 'issue' | 'expiresAt' | 'extendedUntil'>>;

export type { ReportPage, ReportFilter, ReportPatch };
