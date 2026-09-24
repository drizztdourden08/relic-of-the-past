/* @layer renderer-components @kind component */
import { Text } from '@ds/primitives';
import type { UseControllerReportForm } from '../controller-report-form.type';
import { ReportSection } from './ReportSection';

type ConfirmStepProps = Pick<
  UseControllerReportForm,
  'me' | 'email' | 'name' | 'additionalInfo' | 'debugText' | 'detection' | 'calibrationMap' | 'diagnosticsReport' | 'status'
>;

/** Step 4: review EVERYTHING that will be sent. Dense sections stay collapsed, but nothing is left out. */
const ConfirmStep = (props: ConfirmStepProps) => {
  const { me, email, name, additionalInfo, debugText, detection, calibrationMap, diagnosticsReport, status } = props;
  const contact = me ? me.user.displayName : `${email}${name.trim() ? ` (${name.trim()})` : ''}`;

  return (
    <>
      <Text as="p">
        <Text as="strong">{me ? 'Reporting as:' : 'Contact:'}</Text> {contact}
      </Text>
      <ReportSection label="Additional info you entered" text={additionalInfo.trim() || '(none provided)'} />

      <Text as="p">
        <Text as="strong">Detected as:</Text> {detection.detectedName} ({detection.vendorId}:{detection.productId})
      </Text>
      <Text as="p">
        <Text as="strong">Closest SDL match:</Text> {detection.sdlMatch ?? 'none found'}
      </Text>
      <Text as="p">
        <Text as="strong">Input type:</Text> {detection.inputApi}
      </Text>

      <ReportSection label="Full HID read" text={detection.hidReport} />
      <ReportSection label="Byte-level calibration map (JSON)" text={calibrationMap ? JSON.stringify(calibrationMap, null, 2) : ''} />
      <ReportSection label="Gamepad diagnostics report (JSON)" text={diagnosticsReport ? JSON.stringify(diagnosticsReport, null, 2) : ''} />
      <ReportSection label="Debug info (app/OS/hardware)" text={debugText ?? 'Collecting...'} />

      <Text as="p" className="controller-report__disclaimer">
        Everything above (every section here and the debug info) will be recorded in a public issue
        on the project's GitHub repository.
        {me ? ' The issue names your account.' : ' Your email stays on the report record and never in the issue.'}
      </Text>

      {status === 'error' && (
        <Text className="controller-report__status controller-report__status--error">
          Couldn't file the report. Try again in a moment.
        </Text>
      )}
    </>
  );
};

export { ConfirmStep };
export type { ConfirmStepProps };
