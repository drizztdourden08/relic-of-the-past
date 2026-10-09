/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { ReportSection } from '../../controller-report/sub-components/ReportSection';
import type { SummaryStepProps } from './diagnostics-steps.type';

const SummaryStep = (props: SummaryStepProps) => {
  const { byteCapture, hasByteCapability, positionalRecords } = props;
  const captured = positionalRecords.filter((r) => r?.status === 'captured');
  const mismatches = captured.filter((r) => r.mismatch);

  return (
    <Box className="diagnostics-wizard__summary">
      <Box className="diagnostics-wizard__summary-col">
        <Text as="h4">Byte capture</Text>
        {!hasByteCapability ? (
          <Text as="p" className="diagnostics-wizard__summary-empty">
            This controller reports through XInput and not HID, so the byte-capture step
            was skipped for it.
          </Text>
        ) : byteCapture ? (
          <>
            <Text as="p">
              {Object.keys(byteCapture.buttons).length} button(s), {Object.keys(byteCapture.axes).length} axis mapping(s)
              mapped from report length {byteCapture.reportLength}.
            </Text>
            <ReportSection label="Byte capture JSON" text={JSON.stringify(byteCapture, null, 2)} />
          </>
        ) : (
          <Text as="p" className="diagnostics-wizard__summary-empty">No byte capture was recorded.</Text>
        )}
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
export type { SummaryStepProps };
