/* @layer sanctuary-site @kind logic */
import type { ReportContents } from '@rotp/hub-contracts';

const contentsLine = (contents: ReportContents | undefined): string => {
  if (!contents) return 'no attachment';
  const parts = [
    contents.saves ? `${contents.saves} ${contents.saves === 1 ? 'save' : 'saves'}` : null,
    contents.captureSessions ? `${contents.captureSessions} ${contents.captureSessions === 1 ? 'capture' : 'captures'}` : null,
    contents.logs ? 'logs' : null,
  ].filter((part): part is string => part !== null);
  return parts.length ? parts.join(' · ') : 'empty zip';
};

export { contentsLine };
