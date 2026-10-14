/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { ReportSection } from '../../controller-report/sub-components/ReportSection';
import type { ByteCaptureSummaryProps } from './diagnostics-steps.type';

const ByteCaptureSummary = (props: ByteCaptureSummaryProps) => {
  const { byteCapture, hasByteCapability } = props;

  if (!hasByteCapability) {
    return (
      <Text as="p" className="diagnostics-wizard__summary-empty">
        This controller reports through XInput and not HID, so the byte-capture step
        was skipped for it.
      </Text>
    );
  }

  if (!byteCapture) {
    return <Text as="p" className="diagnostics-wizard__summary-empty">No byte capture was recorded.</Text>;
  }

  return (
    <>
      <Text as="p">
        {Object.keys(byteCapture.buttons).length} button(s), {Object.keys(byteCapture.axes).length} axis mapping(s)
        mapped from report length {byteCapture.reportLength}.
      </Text>
      <ReportSection label="Byte capture JSON" text={JSON.stringify(byteCapture, null, 2)} />
    </>
  );
};

export { ByteCaptureSummary };
