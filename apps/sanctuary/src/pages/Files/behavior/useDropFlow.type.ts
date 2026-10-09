/* @layer sanctuary-site @kind types */
import type { SanctuaryFile } from '@rotp/hub-contracts';
import type { UploadTarget } from '../../../upload/upload-target.type';

type UseDropFlowParams = {
  files: readonly SanctuaryFile[];
  start: (files: File[], target: UploadTarget) => void;
};

export type { UseDropFlowParams };
