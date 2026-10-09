/* @layer electron-main @kind logic */
import { app } from 'electron';
import type { BugReportPayload } from '@drizztdourden08/brock-core/types';
import type { SanctuaryReportSnapshot } from '@shared/ipc';
import type { ReportContext, ReportZip, SubmitReportRequest } from '@rotp/hub-contracts';
import { devicePlatform, PLATFORM_LABELS } from '../../hub/device';
import { MAX_DEBUG_INFO_CHARS } from './bug-report.constants';

const contextOf = (snapshot: SanctuaryReportSnapshot | null): ReportContext =>
  snapshot?.context ?? { appVersion: app.getVersion(), platform: PLATFORM_LABELS[devicePlatform()], screenId: null };

const reportRequest = (payload: BugReportPayload, snapshot: SanctuaryReportSnapshot | null, attachment: ReportZip | null): SubmitReportRequest => ({
  kind: 'player',
  subject: payload.title.trim(),
  description: payload.description.trim(),
  debugInfo: (payload.diagnostics?.text ?? '').slice(0, MAX_DEBUG_INFO_CHARS),
  context: contextOf(snapshot),
  contactEmail: null,
  attachment,
});

export { reportRequest };
