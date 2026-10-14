/* @layer renderer-components @kind types */
import type { MsuFilePanelProps } from '../MsuFilePanel.type';
import type { useFileUsage } from './useFileUsage';
import type { useSupersededFiles } from './useSupersededFiles';
import type { ActionResult } from '../msu.type';

type FileConfirmsParams = Pick<MsuFilePanelProps, 'onDeleteConfirm'> & {
  usage: ReturnType<typeof useFileUsage>;
  covered: ReturnType<typeof useSupersededFiles>;
  deleteFile: (fileName: string) => void;
  report: (result: ActionResult) => void;
};

export type { FileConfirmsParams };
