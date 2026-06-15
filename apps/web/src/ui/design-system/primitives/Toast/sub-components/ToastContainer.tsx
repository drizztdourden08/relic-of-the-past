/* @layer renderer-components @kind component */
import { Portal } from '../../Portal';
import { Toast } from '../Toast';
import type { ToastContainerProps } from '../Toast.type';

const ToastContainer = (props: ToastContainerProps) => {
  const { toasts, onDismiss } = props;

  if (toasts.length === 0) return null;

  return (
    <Portal layer="toast">
      <div className="toast-container">
        {toasts.map((t) => (
          <Toast key={t.id} item={t} onDismiss={onDismiss} />
        ))}
      </div>
    </Portal>
  );
};

export { ToastContainer };
