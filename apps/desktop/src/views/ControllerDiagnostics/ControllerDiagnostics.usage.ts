/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The diagnostics page of the Controllers area: the gamepad diagnostics wizard inline, and the last result under it.',
  useWhen: ['As the body of the Diagnostics page, or opened from a pad page with that pad chosen.'],
  avoidWhen: [{ case: 'A one-off dialog over another page.', use: 'DialogShell' }],
  rules: [
    'Pass initialDeviceKey to start the run with that controller chosen.',
    'The wizard releases the controllers while it is on screen and restores them when it ends or the page closes.',
  ],
  a11y: ['Each step of the wizard names itself in the step strip above it.'],
  buildingBlock: true,
  example: `import { ControllerDiagnostics } from '@app/views/ControllerDiagnostics';\n\nconst Diagnostics = ({ deviceKey }: { deviceKey: string }) => <ControllerDiagnostics initialDeviceKey={deviceKey} />;\n`,
  propsHash: '4a5b39ff39aff575',
} satisfies ComponentUsage;

export { usage };
