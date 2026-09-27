/* @layer renderer-components @kind component */
import { Portal } from '../../Portal';
import { Toast } from '../Toast';
import type { ToastContainerProps } from '../Toast.type';

const ToastContainer = (props: ToastContainerProps) => {
  const { toasts, onDismiss, position = 'bottom-right', anchored = false } = props;

  if (toasts.length === 0) return null;

  const stack = (
    <div className={`toast-container toast-container--${position}${anchored ? ' toast-container--anchored' : ''}`}>
      {toasts.map((t) => (
        <Toast key={t.id} item={t} onDismiss={onDismiss} />
      ))}
    </div>
  );

  return anchored ? stack : <Portal layer="toast">{stack}</Portal>;
};

export { ToastContainer };
