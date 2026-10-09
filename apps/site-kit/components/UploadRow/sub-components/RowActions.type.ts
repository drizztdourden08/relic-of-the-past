/* @layer site-kit @kind types */
import type { UploadJob } from '../../../upload/upload-job.type';
import type { UploadRowProps } from '../UploadRow.type';

type RowActionsProps = Pick<UploadRowProps, 'onCancel' | 'onDismiss' | 'onPickFile'> & { job: UploadJob };

export type { RowActionsProps };
