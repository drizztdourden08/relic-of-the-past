/* @layer renderer-components @kind component */
import { Portal } from '../../Portal';
import { Toast } from '../Toast';
import type { ToastContainerProps } from '../Toast.type';

const ToastContainer = (props: ToastContainerProps) => {
  const { toasts, onDismiss, position = 'bottom-right' } = props;

  if (toasts.length === 0) return null;

  return (
    <Portal layer="toast">
      <div className={`toast-container toast-container--${position}`}>
        {toasts.map((t) => (
          <Toast key={t.id} item={t} onDismiss={onDismiss} />
        ))}
      </div>
    </Portal>
  );
};

export { ToastContainer };
