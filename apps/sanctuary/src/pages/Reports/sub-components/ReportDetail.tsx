/* @layer sanctuary-site @kind component */
/**
 * The selected report: reporter (with the GitHub handle when the API gave one), the issue
 * chip, kind, version and platform, screen, contents, size, filed and expiry, then the
 * actions. Delete is for admins; everyone else sees it disabled with the reason.
 */
import { useState } from 'react';
import { LIMITS } from '@shared/sanctuary/limits';
import { Button } from '@ds/primitives/Button';
import { Dialog } from '@ds/composites/Dialog';
import { DetailPane } from '../../../components/DetailPane/DetailPane';
import type { DetailField } from '../../../components/DetailPane/DetailPane';
import { IssueStateChip } from '../../../components/IssueStateChip/IssueStateChip';
import { ExternalLink } from '../../../components/ExternalLink/ExternalLink';
import type { ReportView } from '../../../api/types';
import { ANONYMOUS, contentsLine } from '../../../reports/report-row';
import { formatBytes } from '../../../lib/format-bytes';
import { formatDateTime } from '../../../lib/format-date';
import type { ReportActions } from '../behavior/useReportActions';
import { deadlineOf } from '../behavior/report-scopes';

type ReportDetailProps = {
  report: ReportView;
  isAdmin: boolean;
  actions: ReportActions;
  onClose: () => void;
};

const KIND_LABELS = { player: 'player report', controller: 'controller report' } as const;

const reporterLine = (report: ReportView): string => {
  const { reporter } = report;
  if (!reporter) return ANONYMOUS;
  return reporter.githubHandle ? `${reporter.displayName} (@${reporter.githubHandle})` : reporter.displayName;
};

const expiryLine = (report: ReportView): string => {
  const deadline = deadlineOf(report);
  if (deadline !== null) return formatDateTime(deadline);
  return report.issue.state === 'open' ? 'after the issue closes' : 'not set';
};

const fieldsOf = (report: ReportView): DetailField[] => [
  { label: 'reporter', value: reporterLine(report) },
  { label: 'issue', value: <IssueStateChip issue={report.issue} /> },
  { label: 'kind', value: KIND_LABELS[report.kind] },
  { label: 'version', value: `${report.appVersion} · ${report.platform}` },
  { label: 'screen', value: report.screenId ?? '-' },
  { label: 'contents', value: contentsLine(report.zip?.contents) },
  { label: 'size', value: report.zip ? formatBytes(report.zip.bytes) : '-' },
  { label: 'filed', value: formatDateTime(report.createdAt) },
  { label: 'expires', value: expiryLine(report) },
  ...(report.legacy ? [{ label: 'legacy', value: 'migrated from the old bucket' }] : []),
];

const ReportDetail = (props: ReportDetailProps) => {
  const { report, isAdmin, actions, onClose } = props;
  const [confirming, setConfirming] = useState(false);
  const { busy } = actions;

  const buttons = (
    <>
      <Button variant="primary" size="sm" disabled={busy || !report.zip} onClick={() => void actions.download(report.id)}>
        Download zip
      </Button>
      <ExternalLink href={report.issue.url} className="btn btn--secondary btn--sm">
        Open issue {'↗'}
      </ExternalLink>
      <Button variant="secondary" size="sm" disabled={busy} onClick={() => void actions.extend(report.id)}>
        Extend +{LIMITS.extendDays} d
      </Button>
      <Button
        variant="danger"
        size="sm"
        disabled={busy || !isAdmin}
        title={isAdmin ? undefined : 'admin only'}
        onClick={() => setConfirming(true)}
      >
        Delete
      </Button>
    </>
  );

  return (
    <DetailPane title={report.subject} fields={fieldsOf(report)} actions={buttons} notice={actions.notice} onClose={onClose}>
      <Dialog
        open={confirming}
        title="Delete report"
        message={`Delete "${report.subject}"? The zip is removed; the GitHub issue stays.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { setConfirming(false); void actions.remove(report.id); }}
        onCancel={() => setConfirming(false)}
      />
    </DetailPane>
  );
};

export { ReportDetail };
export type { ReportDetailProps };
