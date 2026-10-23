/* @layer renderer-app @kind component */
import type { ScreenMeta } from '@drizztdourden08/brock-react';
import { ControllerLogs } from '@app/views/ControllerLogs';

const meta: ScreenMeta = { title: 'Logs', icon: 'scroll-text', order: 1, fill: true, keywords: ['log', 'connect', 'disconnect', 'hid', 'report', 'history'] };

const LogsPage = () => <ControllerLogs />;

export default LogsPage;
export { meta };
