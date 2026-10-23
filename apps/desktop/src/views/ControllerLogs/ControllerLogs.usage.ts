/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The controller log page: connects, disconnects and the HID diagnostic lines, with search, kind filters and Copy all.',
  useWhen: ['As the body of the Logs page of the Controllers area.'],
  avoidWhen: [{ case: 'Rows with columns to sort and resize.', use: 'DataTable' }],
  rules: ['The history comes from the controller event log, which is started at boot, so the page shows lines from before it was opened.'],
  a11y: ['The log is one focusable region that the arrow keys scroll.'],
  buildingBlock: true,
  example: `import { ControllerLogs } from '@app/views/ControllerLogs';\n\nconst Logs = () => <ControllerLogs />;\n`,
  propsHash: '69a6789bb8733db8',
} satisfies ComponentUsage;

export { usage };
