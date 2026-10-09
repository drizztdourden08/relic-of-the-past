/* @layer renderer-components @kind types */
import type { useControllerReportForm } from './behavior/useControllerReportForm';

type UseControllerReportForm = ReturnType<typeof useControllerReportForm>;

type ConfirmStepProps = Pick<
  UseControllerReportForm,
  'me' | 'email' | 'name' | 'additionalInfo' | 'debugText' | 'detection' | 'calibrationMap' | 'diagnosticsReport' | 'status'
>;

type UserInfoStepProps = Pick<
  UseControllerReportForm,
  'me' | 'email' | 'setEmail' | 'emailTouched' | 'emailValid' | 'name' | 'setName' | 'additionalInfo' | 'setAdditionalInfo' | 'debugText'
>;

export type { ConfirmStepProps, UseControllerReportForm, UserInfoStepProps };
