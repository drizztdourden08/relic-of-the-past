/* @layer root-config @kind logic */
/** A player report: the reporter line, the reporter's own words uncollapsed,
 *  then the debug info block. No email ever reaches the public body. */
import { debugInfoBlock } from './details-block';
import type { IssueBodyRenderer } from './issue-body.type';

const renderPlayerBody: IssueBodyRenderer = ({ reporterLine, description, debugInfo, reportId }) =>
  [reporterLine, description.trim(), debugInfoBlock(reportId, debugInfo)].join('\n\n');

export { renderPlayerBody };
