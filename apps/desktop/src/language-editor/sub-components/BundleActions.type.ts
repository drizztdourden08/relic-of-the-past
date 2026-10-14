/* @layer renderer-components @kind types */
import type { BundleHeaderProps } from './BundleHeader.type';

type BundleActionsProps = Pick<BundleHeaderProps, 'dirty' | 'saving' | 'onDuplicate' | 'onSaveNow' | 'onExport' | 'exportStatus'>
  & Required<Pick<BundleHeaderProps, 'readOnly' | 'exporting'>>;

export type { BundleActionsProps };
