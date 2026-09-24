/* @layer root-config @kind logic */
/** A controller report: the player shape plus one collapsed block per recorded
 *  artefact, in a fixed order, whatever the wizard captured. */
import type { SubmitReportRequest } from '../../../../shared/sanctuary';
import { debugInfoBlock, detailsBlock } from './details-block';
import type { IssueBodyRenderer } from './issue-body.type';

const controllerBlocks = (report: SubmitReportRequest['controllerReport']): string[] => {
  if (!report) return [];
  const artefacts: [string, string | undefined][] = [
    ['Device identity', `Detected as: ${report.detectedName} (${report.vendorId}:${report.productId}, input: ${report.inputApi})
Closest SDL match: ${report.sdlMatch ?? 'none found'}`],
    ['Full HID read', report.hidReport],
    ['Calibration byte report (JSON)', report.calibrationMap],
    ['Positional capture (JSON)', report.positionalCapture],
    ['Diagnostics report (JSON)', report.diagnosticsReport],
  ];
  return artefacts
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .map(([summary, body]) => detailsBlock(summary, body));
};

const renderControllerBody: IssueBodyRenderer = ({ reporterLine, description, debugInfo, reportId, controllerReport }) =>
  [reporterLine, description.trim(), ...controllerBlocks(controllerReport), debugInfoBlock(reportId, debugInfo)].join('\n\n');

export { renderControllerBody };
