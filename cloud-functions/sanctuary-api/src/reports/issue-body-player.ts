/* @layer root-config @kind logic */
import { debugInfoBlock } from './debug-info-block';
import type { IssueBodyRenderer } from './issue-body.type';

const renderPlayerBody: IssueBodyRenderer = ({ reporterLine, description, debugInfo, reportId }) =>
  [reporterLine, description.trim(), debugInfoBlock(reportId, debugInfo)].join('\n\n');

export { renderPlayerBody };
