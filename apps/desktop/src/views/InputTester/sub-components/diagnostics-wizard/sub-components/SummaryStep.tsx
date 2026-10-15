/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { ReportSection } from '../../controller-report/sub-components/ReportSection';
import { ByteCaptureSummary } from './ByteCaptureSummary';
import type { SummaryStepProps } from './diagnostics-steps.type';

const SummaryStep = (props: SummaryStepProps) => {
  const { byteCapture, hasByteCapability, positionalRecords } = props;
  const captured = positionalRecords.filter((r) => r.status === 'captured');
  const mismatches = captured.filter((r) => r.mismatch);

  return (
    <Box className="diagnostics-wizard__summary">
      <Box className="diagnostics-wizard__summary-col">
        <Text as="h4">Byte capture</Text>
        <ByteCaptureSummary byteCapture={byteCapture} hasByteCapability={hasByteCapability} />
      </Box>

      <Box className="diagnostics-wizard__summary-col">
        <Text as="h4">Positional capture</Text>
        {captured.length > 0 ? (
          <>
            <Text as="p">
              {captured.length} of {positionalRecords.length} input(s) answered.
              {mismatches.length > 0 && ` ${mismatches.length} fired at a different position than the preset expects.`}
            </Text>
            <ReportSection label="Positional capture JSON" text={JSON.stringify(positionalRecords, null, 2)} />
          </>
        ) : (
          <Text as="p" className="diagnostics-wizard__summary-empty">No positional capture was recorded.</Text>
        )}
      </Box>
    </Box>
  );
};

export { SummaryStep };
