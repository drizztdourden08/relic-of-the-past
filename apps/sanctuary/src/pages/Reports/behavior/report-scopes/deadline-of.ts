/* @layer sanctuary-site @kind logic */
import type { ReportView } from '../../../../endpoints/api-responses.type';

const deadlineOf = (report: ReportView): number | null => {
  const { expiresAt, extendedUntil } = report;
  if (expiresAt === null) return extendedUntil;
  if (extendedUntil === null) return expiresAt;
  return Math.max(expiresAt, extendedUntil);
};

export { deadlineOf };
