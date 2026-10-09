/* @layer sanctuary-site @kind component */
import { useState } from 'react';
import { LIMITS } from '@rotp/hub-contracts';
import { Button, Link } from '@drizztdourden08/tessera/primitives';
import { Dialog } from '@drizztdourden08/tessera/composites';
import { DetailPane } from '@rotp/design';
import type { DetailField } from '@rotp/design';
import { IssueStateChip } from '../../../components/IssueStateChip/IssueStateChip';
import type { ReportView } from '../../../api/api-responses.type';
import { ANONYMOUS, contentsLine } from '../../../reports/report-row';
import { formatBytes, formatDateTime } from '@rotp/hub-client';
import { deadlineOf } from '../behavior/report-scopes';
import { KIND_LABELS } from './ReportDetail.constants';
import type { ReportDetailProps } from './ReportDetail.type';

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
      <Link href={report.issue.url} external className="btn btn--secondary btn--toned btn--sm">
        Open issue
      </Link>
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
