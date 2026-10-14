/* @layer renderer-components @kind types */
import type { BundleHeaderProps } from './BundleHeader.type';

type SaveStatusBadgeProps = Pick<BundleHeaderProps, 'saveError' | 'readOnly' | 'saving' | 'dirty'>;

type SaveStatus = { tone: 'danger' | 'neutral' | 'warning' | 'success'; text: string };

export type { SaveStatus, SaveStatusBadgeProps };
