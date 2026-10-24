/* @layer renderer-app @kind component */
import type { PageProps, ScreenMeta } from '@drizztdourden08/brock-react';
import { ControllerDiagnostics, padParamOf } from '@app/views/ControllerDiagnostics';

const meta: ScreenMeta = {
  title: 'Diagnostics',
  icon: 'wrench',
  order: 2,
  keywords: ['diagnostics', 'wizard', 'calibrate', 'buttons', 'mapping', 'raw bytes', 'hid'],
};

const DiagnosticsPage = (props: PageProps) => {
  const pad = padParamOf(props.params);
  return <ControllerDiagnostics key={pad ?? ''} initialDeviceKey={pad} />;
};

export default DiagnosticsPage;
export { meta };
