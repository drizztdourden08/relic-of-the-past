/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { ReportDialogPartProps } from '../report-dialog-controls.type';

interface ReportBodyProps extends ReportDialogPartProps {
  summaryActions?: ReactNode;
}

export type { ReportBodyProps };
