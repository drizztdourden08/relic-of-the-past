/* @layer renderer-components @kind component */
import { Box, Status, Text } from '@drizztdourden08/tessera/primitives';
import { PART_LABELS, PART_STATUSES } from './PatchedImportReport.constants';
import type { PatchedImportReportProps } from './PatchedImportReport.type';
import './PatchedImportReport.css';

const PatchedImportReport = (props: PatchedImportReportProps) => {
  const { parts } = props;
  if (parts.length === 0) return null;

  return (
    <Box className="patched-report" role="list">
      {parts.map(({ part, status, detail }) => (
        <Box key={part} className="patched-report__row" role="listitem">
          <Box className="patched-report__head">
            <Text className="patched-report__part">{PART_LABELS[part]}</Text>
            <Status map={PART_STATUSES} value={status} size="sm" />
          </Box>
          <Text className="patched-report__detail">{detail}</Text>
        </Box>
      ))}
    </Box>
  );
};

export { PatchedImportReport };
