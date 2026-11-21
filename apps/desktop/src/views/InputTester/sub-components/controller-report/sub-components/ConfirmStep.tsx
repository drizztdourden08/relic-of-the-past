/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Text } from '@drizztdourden08/tessera/primitives';
import { describeReportContact } from '../behavior/describe-report-contact';
import { stringifyOrEmpty } from '../behavior/stringify-or-empty';
import type { ConfirmStepProps } from '../controller-report-form.type';
import { ReportSection } from '@drizztdourden08/brock-input/renderer';

const ConfirmStep = (props: ConfirmStepProps) => {
  const t = useT();
  const { me, email, name, additionalInfo, debugText, detection, calibrationMap, diagnosticsReport, status } = props;
  const contact = describeReportContact({ me, email, name });

  return (
    <>
      <Text as="p">
        <Text as="strong">{me ? t('views-input-tester:confirm.reportingAs') : t('views-input-tester:confirm.contact')}</Text> {contact}
      </Text>
      <ReportSection label={t('views-input-tester:confirm.additionalInfo')} text={additionalInfo.trim() || t('views-input-tester:confirm.noneProvided')} />

      <Text as="p">
        <Text as="strong">{t('views-input-tester:confirm.detectedAs')}</Text> {detection.detectedName} ({detection.vendorId}:{detection.productId})
      </Text>
      <Text as="p">
        <Text as="strong">{t('views-input-tester:confirm.sdlMatch')}</Text> {detection.sdlMatch ?? t('views-input-tester:confirm.noneFound')}
      </Text>
      <Text as="p">
        <Text as="strong">{t('views-input-tester:confirm.inputType')}</Text> {detection.inputApi}
      </Text>

      <ReportSection label={t('views-input-tester:confirm.hid')} text={detection.hidReport} />
      <ReportSection label={t('views-input-tester:confirm.calibration')} text={stringifyOrEmpty(calibrationMap)} />
      <ReportSection label={t('views-input-tester:confirm.diagnostics')} text={stringifyOrEmpty(diagnosticsReport)} />
      <ReportSection label={t('views-input-tester:confirm.debug')} text={debugText ?? t('views-input-tester:collecting')} />

      <Text as="p" className="controller-report__disclaimer">
        {me ? t('views-input-tester:confirm.disclaimerMe') : t('views-input-tester:confirm.disclaimerEmail')}
      </Text>

      {status === 'error' && (
        <Text className="controller-report__status controller-report__status--error">
          {t('views-input-tester:confirm.error')}
        </Text>
      )}
    </>
  );
};

export { ConfirmStep };
