/* @layer root-config @kind constants */
import type { ReportKind } from '@rotp/hub-contracts';
import { renderPlayerBody } from './issue-body-player';
import { renderControllerBody } from './issue-body-controller';
import type { IssueBodyRenderer } from './issue-body.type';

const ZIP_CONTENT_TYPE = 'application/zip';
const ANONYMOUS_WINDOW_MS = 10 * 60 * 1000;

const BODY_BY_KIND: Record<ReportKind, IssueBodyRenderer> = {
  player: renderPlayerBody,
  controller: renderControllerBody,
};

const LABEL_BY_KIND: Record<ReportKind, string> = {
  player: 'player-report',
  controller: 'controller-report',
};

export { ZIP_CONTENT_TYPE, ANONYMOUS_WINDOW_MS, BODY_BY_KIND, LABEL_BY_KIND };
