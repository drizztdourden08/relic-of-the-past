/* @layer renderer-app @kind logic */
import type { BugReportPayload, BugReportReceipt, ProductRepo, Result } from '@drizztdourden08/brock-core';
import { buildIssueUrl, openExternal, useProfilesStore } from '@drizztdourden08/brock-react';
import type { ReportContext } from '@shared/sanctuary';
import { appApi } from '@app/ipc/app-api';
import { collectSaveStates } from '@app/lib/diagnostics/collect-save-states';
import { useHubSessionStore } from '@app/stores/hub-session';
import { MAX_DEBUG_INFO_CHARS, SIGNED_OUT_MESSAGE } from './bug-report.constants';

const savesOf = async (profileId: string | null) => {
  if (!profileId) return [];
  try {
    return await collectSaveStates(profileId);
  } catch {
    return [];
  }
};

const createSanctuaryTransport = (repo: ProductRepo | undefined, contextOf: () => ReportContext) =>
  async (payload: BugReportPayload): Promise<Result<BugReportReceipt>> => {
    const diagnostics = payload.diagnostics?.text ?? null;
    if (useHubSessionStore.getState().me === null) {
      if (!repo) return { success: false, error: 'Sign in to the Sanctuary to send a report.' };
      openExternal(buildIssueUrl({ repo, title: payload.title, description: payload.description, diagnostics }));
      return { success: true, value: { message: SIGNED_OUT_MESSAGE } };
    }
    const profileId = useProfilesStore.getState().active?.id ?? null;
    try {
      const result = await appApi().submitSanctuaryReport({
        request: {
          kind: 'player',
          subject: payload.title.trim(),
          description: payload.description.trim(),
          debugInfo: (diagnostics ?? '').slice(0, MAX_DEBUG_INFO_CHARS),
          context: contextOf(),
          contactEmail: null,
        },
        profileId,
        saves: await savesOf(profileId),
        sessionKeys: [],
      });
      if (!('reportId' in result)) return { success: false, error: result.error };
      return { success: true, value: { message: `Report ${result.reportId} filed`, url: result.sanctuaryUrl, id: result.reportId } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  };

export { createSanctuaryTransport };
