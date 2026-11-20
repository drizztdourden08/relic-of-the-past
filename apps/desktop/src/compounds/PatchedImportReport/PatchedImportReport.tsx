/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { useT, useText } from '@drizztdourden08/brock-react';
import { Box, Status, Text, defineStatuses } from '@drizztdourden08/tessera/primitives';
import { PART_LABELS } from './PatchedImportReport.constants';
import type { PatchedImportReportProps } from './PatchedImportReport.type';
import './PatchedImportReport.css';

const PatchedImportReport = (props: PatchedImportReportProps) => {
  const t = useT();
  const text = useText();
  const { parts } = props;
  const statuses = useMemo(() => defineStatuses({
    ok: { label: t('compounds:patched-import-report.status.ok'), tone: 'success' },
    recovered: { label: t('compounds:patched-import-report.status.recovered'), tone: 'warning' },
    failed: { label: t('compounds:patched-import-report.status.failed'), tone: 'danger' },
  }), [t]);
  if (parts.length === 0) return null;

  return (
    <Box className="patched-report" role="list">
      {parts.map(({ part, status, detail }) => (
        <Box key={part} className="patched-report__row" role="listitem">
          <Box className="patched-report__head">
            <Text className="patched-report__part">{text(PART_LABELS[part])}</Text>
            <Status map={statuses} value={status} size="sm" />
          </Box>
          <Text className="patched-report__detail">{text(detail)}</Text>
        </Box>
      ))}
    </Box>
  );
};

export { PatchedImportReport };
