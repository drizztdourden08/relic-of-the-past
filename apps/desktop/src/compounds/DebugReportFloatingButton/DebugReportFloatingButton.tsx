/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import send from '@iconify-icons/lucide/send';
import { Pressable } from '@drizztdourden08/tessera/primitives';
import type { DebugReportFloatingButtonProps } from './DebugReportFloatingButton.type';
import './DebugReportFloatingButton.css';

const DebugReportFloatingButton = (props: DebugReportFloatingButtonProps) => {
  const t = useT();
  const { dragging, onPointerDown, onPointerMove, onPointerUp, onOpenReport } = props;

  return (
    <Pressable
      className="debug-round-button debug-report-floating-button"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={() => { if (!dragging) onOpenReport(); }}
      title={t('compounds:debug-report-floating-button.report-a-bug-with-a')}
      aria-label={t('compounds:debug-report-floating-button.report-a-bug')}
    >
      <IconifyIcon icon={send} width={16} height={16} />
    </Pressable>
  );
};

export { DebugReportFloatingButton };
