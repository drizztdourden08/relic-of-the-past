/* @layer renderer-components @kind logic */
import type { SanctuarySubmitInput } from '@app/ipc';
import type { ReportRequestParams } from './build-report-request.type';

const buildDescription = (params: Pick<ReportRequestParams, 'me' | 'name' | 'additionalInfo'>): string => {
  const { me, name, additionalInfo } = params;
  return [
    !me && name.trim() ? `Reported by: ${name.trim()}` : null,
    additionalInfo.trim() || 'No additional info provided.',
  ].filter(Boolean).join('\n\n');
};

const buildControllerReport = (params: ReportRequestParams): NonNullable<SanctuarySubmitInput['request']['controllerReport']> => {
  const { detection, calibrationMap, positionalRecords, diagnosticsReport } = params;
  return {
    detectedName: detection.detectedName,
    sdlMatch: detection.sdlMatch,
    inputApi: detection.inputApi,
    vendorId: detection.vendorId,
    productId: detection.productId,
    hidReport: detection.hidReport,
    calibrationMap: JSON.stringify(calibrationMap, null, 2),
    ...(positionalRecords.length > 0 && { positionalCapture: JSON.stringify(positionalRecords, null, 2) }),
    ...(diagnosticsReport && { diagnosticsReport: JSON.stringify(diagnosticsReport, null, 2) }),
  };
};

const buildReportRequest = (params: ReportRequestParams): SanctuarySubmitInput['request'] => {
  const { subjectPrefix, context, me, email, detection, debugText } = params;
  return {
    kind: 'controller',
    subject: `${subjectPrefix}Controller ${detection.detectedName} (${detection.vendorId}:${detection.productId})`,
    description: buildDescription(params),
    debugInfo: debugText,
    context,
    contactEmail: me ? null : email.trim(),
    controllerReport: buildControllerReport(params),
  };
};

export { buildReportRequest };
