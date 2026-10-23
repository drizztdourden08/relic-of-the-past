/* @layer renderer-app @kind component */
import type { PageProps, ScreenMeta } from '@drizztdourden08/brock-react';
import { ControllerDiagnostics } from '@app/views/ControllerDiagnostics';
import { padParamOf } from '@app/views/ControllerPads';

const meta: ScreenMeta = {
  title: 'Controller Diagnostics',
  icon: 'wrench',
  order: 2,
  keywords: ['diagnostics', 'wizard', 'calibrate', 'buttons', 'mapping', 'raw bytes', 'hid'],
};

const DiagnosticsPage = (props: PageProps) => <ControllerDiagnostics initialDeviceKey={padParamOf(props.params)} />;

export default DiagnosticsPage;
export { meta };
