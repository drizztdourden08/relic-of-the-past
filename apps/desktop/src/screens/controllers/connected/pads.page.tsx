/* @layer renderer-app @kind component */
import { useCallback } from 'react';
import type { PageProps, ScreenMeta } from '@drizztdourden08/brock-react';
import { ControllerPads, PAD_PARAM, padParamOf } from '@app/views/ControllerPads';
import { DIAGNOSTICS_ROUTE } from '../controllers.constants';

const meta: ScreenMeta = {
  title: 'Controllers',
  icon: 'gamepad-2',
  fill: true,
  keywords: ['controller', 'gamepad', 'hid', 'rumble', 'raw bytes', 'stick', 'trigger', 'calibrate', 'report'],
};

const PadsPage = (props: PageProps) => {
  const { params, open } = props;
  const initial = padParamOf(params);
  const runDiagnostics = useCallback((deviceKey: string) => open(DIAGNOSTICS_ROUTE, { [PAD_PARAM]: deviceKey }), [open]);

  return <ControllerPads key={initial ?? ''} initialDeviceKey={initial} onRunDiagnostics={runDiagnostics} />;
};

export default PadsPage;
export { meta };
