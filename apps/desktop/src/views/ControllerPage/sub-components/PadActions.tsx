/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import bugIcon from '@iconify-icons/lucide/bug';
import stethoscopeIcon from '@iconify-icons/lucide/stethoscope';
import { PageActions } from '@drizztdourden08/brock-react';
import { Button, IconButton } from '@drizztdourden08/tessera/primitives';
import { REPORT_LABEL, RUN_DIAGNOSTICS_LABEL } from '../ControllerPage.constants';
import type { PadActionsProps } from '../ControllerPage.type';

const PadActions = ({ deviceKey, onRunDiagnostics, onReport }: PadActionsProps) => {
  const runDiagnostics = useCallback(() => onRunDiagnostics?.(deviceKey), [onRunDiagnostics, deviceKey]);
  const report = useCallback(() => onReport(deviceKey), [onReport, deviceKey]);

  return (
    <PageActions>
      {onRunDiagnostics && (
        <Button variant="tertiary" size="sm" icon={<IconifyIcon icon={stethoscopeIcon} width={14} height={14} />} onClick={runDiagnostics}>
          {RUN_DIAGNOSTICS_LABEL}
        </Button>
      )}
      <IconButton variant="ghost" size="sm" label={REPORT_LABEL} title={REPORT_LABEL} onClick={report}>
        <IconifyIcon icon={bugIcon} width={14} height={14} />
      </IconButton>
    </PageActions>
  );
};

export { PadActions };
