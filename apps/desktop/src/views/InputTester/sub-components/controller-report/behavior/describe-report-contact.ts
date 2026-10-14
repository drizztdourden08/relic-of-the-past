/* @layer renderer-components @kind logic */
import type { ConfirmStepProps } from '../controller-report-form.type';

const describeReportContact = (params: Pick<ConfirmStepProps, 'me' | 'email' | 'name'>): string => {
  const { me, email, name } = params;
  if (me) return me.user.displayName;
  return `${email}${name.trim() ? ` (${name.trim()})` : ''}`;
};

export { describeReportContact };
