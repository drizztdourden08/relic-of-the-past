/* @layer renderer-app @kind logic */
import type { Text } from '@drizztdourden08/brock-core/i18n';
import type { BugReportPayload, BugReportReceipt, ProductRepo, Result } from '@drizztdourden08/brock-core';
import { buildIssueUrl, openExternal } from '@drizztdourden08/brock-react';
import { NO_REPO_ERROR, SIGNED_OUT_MESSAGE } from './bug-report.constants';

const openIssueInstead = (repo: ProductRepo | undefined, payload: BugReportPayload, text: (value: Text) => string): Result<BugReportReceipt> => {
  if (!repo) return { success: false, error: text(NO_REPO_ERROR) };
  const diagnostics = payload.diagnostics?.text ?? null;
  openExternal(buildIssueUrl({ repo, title: payload.title, description: payload.description, diagnostics }));
  return { success: true, value: { message: text(SIGNED_OUT_MESSAGE) } };
};

export { openIssueInstead };
