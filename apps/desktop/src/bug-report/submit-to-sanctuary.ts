/* @layer renderer-app @kind logic */
import type { BugReportPayload, BugReportReceipt, Result } from '@drizztdourden08/brock-core';
import { useProfilesStore } from '@drizztdourden08/brock-react';
import type { ReportContext } from '@shared/sanctuary';
import { appApi } from '@app/ipc/app-api';
import { collectSaveStates } from '@app/lib/diagnostics/collect-save-states';
import { MAX_DEBUG_INFO_CHARS } from './bug-report.constants';

const savesOf = async (profileId: string | null) => {
  if (!profileId) return [];
  try {
    return await collectSaveStates(profileId);
  } catch {
    return [];
  }
};

const submitToSanctuary = async (payload: BugReportPayload, context: ReportContext): Promise<Result<BugReportReceipt>> => {
  const profileId = useProfilesStore.getState().active?.id ?? null;
  const result = await appApi().submitSanctuaryReport({
    request: {
      kind: 'player',
      subject: payload.title.trim(),
      description: payload.description.trim(),
      debugInfo: (payload.diagnostics?.text ?? '').slice(0, MAX_DEBUG_INFO_CHARS),
      context,
      contactEmail: null,
    },
    profileId,
    saves: await savesOf(profileId),
    sessionKeys: [],
  });
  if (!('reportId' in result)) return { success: false, error: result.error };
  return { success: true, value: { message: `Report ${result.reportId} filed`, url: result.sanctuaryUrl, id: result.reportId } };
};

export { submitToSanctuary };
