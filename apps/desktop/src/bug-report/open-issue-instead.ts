/* @layer renderer-app @kind logic */
import type { BugReportPayload, BugReportReceipt, ProductRepo, Result } from '@drizztdourden08/brock-core';
import { buildIssueUrl, openExternal } from '@drizztdourden08/brock-react';
import { SIGNED_OUT_MESSAGE } from './bug-report.constants';

const openIssueInstead = (repo: ProductRepo | undefined, payload: BugReportPayload): Result<BugReportReceipt> => {
  if (!repo) return { success: false, error: 'Sign in to the Sanctuary to send a report.' };
  const diagnostics = payload.diagnostics?.text ?? null;
  openExternal(buildIssueUrl({ repo, title: payload.title, description: payload.description, diagnostics }));
  return { success: true, value: { message: SIGNED_OUT_MESSAGE } };
};

export { openIssueInstead };
