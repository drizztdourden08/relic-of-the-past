/* @layer renderer-components @kind component */
import './EmptyState.css';
import type { EmptyStateProps } from './types';

const EmptyState = (props: EmptyStateProps) => {
  const { message, icon, action, className = '' } = props;
  return (
    <div className={`empty-state${className ? ` ${className}` : ''}`}>
      {icon != null && <div className="empty-state__icon">{icon}</div>}
      <div className="empty-state__message">{message}</div>
      {action != null && <div className="empty-state__action">{action}</div>}
    </div>
  );
};

export { EmptyState };
