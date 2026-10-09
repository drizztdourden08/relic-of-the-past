/* @layer sanctuary-site @kind types */
import type { useFiles } from '../files/useFiles';
import type { useReports } from '../reports/useReports';
import type { SanctuaryQueue } from '../upload/sanctuary-queue.type';

type ListSurface = 'files' | 'reports';

type SiteData = {
  files: ReturnType<typeof useFiles>;
  reports: ReturnType<typeof useReports>;
  uploads: SanctuaryQueue;
  scopes: Record<ListSurface, string>;
  setScope: (surface: ListSurface, scopeId: string) => void;
};

export type { ListSurface, SiteData };
