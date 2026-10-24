/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import bugIcon from '@iconify-icons/lucide/bug';
import stethoscopeIcon from '@iconify-icons/lucide/stethoscope';
import { IconButton } from '@drizztdourden08/tessera/primitives';
import { REPORT_LABEL, RUN_DIAGNOSTICS_LABEL } from '../ControllerPage.constants';
import type { PadActionsProps } from '../ControllerPage.type';

const PadActions = ({ deviceKey, onRunDiagnostics, onReport }: PadActionsProps) => {
  const runDiagnostics = useCallback(() => onRunDiagnostics?.(deviceKey), [onRunDiagnostics, deviceKey]);
  const report = useCallback(() => onReport(deviceKey), [onReport, deviceKey]);

  return (
    <>
      {onRunDiagnostics && (
        <IconButton variant="ghost" size="xs" label={RUN_DIAGNOSTICS_LABEL} title={RUN_DIAGNOSTICS_LABEL} onClick={runDiagnostics}>
          <IconifyIcon icon={stethoscopeIcon} width={14} height={14} />
        </IconButton>
      )}
      <IconButton variant="ghost" size="xs" label={REPORT_LABEL} title={REPORT_LABEL} onClick={report}>
        <IconifyIcon icon={bugIcon} width={14} height={14} />
      </IconButton>
    </>
  );
};

export { PadActions };
