/* @layer renderer-components @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import bugIcon from '@iconify-icons/lucide/bug';
import { IconButton } from '@drizztdourden08/tessera/primitives';
import type { BugReportButtonProps } from './BugReportButton.type';
import './BugReportButton.css';

const BugReportButton = ({ onClick, className = '' }: BugReportButtonProps) => (
  <IconButton
    variant="ghost"
    size="sm"
    label="Report a bug"
    className={`bug-report-button${className ? ` ${className}` : ''}`}
    onClick={onClick}
  >
    <IconifyIcon icon={bugIcon} width={14} height={14} />
  </IconButton>
);

export { BugReportButton };
export type { BugReportButtonProps };
