/* @layer renderer-app @kind logic */
import type { BugReportPayload, BugReportReceipt, ProductRepo, Result } from '@drizztdourden08/brock-core';
import type { ReportContext } from '@shared/sanctuary';
import { useHubSessionStore } from '@app/stores/hub-session';
import { openIssueInstead } from './open-issue-instead';
import { submitToSanctuary } from './submit-to-sanctuary';

const createSanctuaryTransport = (repo: ProductRepo | undefined, contextOf: () => ReportContext) =>
  async (payload: BugReportPayload): Promise<Result<BugReportReceipt>> => {
    if (useHubSessionStore.getState().me === null) return openIssueInstead(repo, payload);
    try {
      return await submitToSanctuary(payload, contextOf());
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  };

export { createSanctuaryTransport };
