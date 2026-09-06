/* @layer renderer-components @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import bugIcon from '@iconify-icons/lucide/bug';
import { IconButton } from '@ds/primitives/IconButton';
import './BugReportButton.css';

interface BugReportButtonProps {
  onClick: () => void;
  className?: string;
}

/**
 * The one bug report button. It lives here instead of the title bar so every place
 * that offers to report something is visibly the same control: same icon, same red,
 * same glow. A second hand-built copy would drift.
 */
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
