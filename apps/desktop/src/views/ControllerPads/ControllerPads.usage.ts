/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The connected controllers area: a nav list with one entry per pad, each with a connection dot, and the page of the picked pad beside it.',
  useWhen: ['As the body of the Connected page of the Controllers area, until the hub draws one nav entry per pad itself.'],
  avoidWhen: [{ case: 'The navigation of a whole area of the app.', use: 'SideNavLayout' }],
  rules: ['Pass initialDeviceKey to open a given pad first; remount it with a new key to follow a new request.', 'The nav lists the pads in the order of the device groups, one entry per port for an adapter.'],
  a11y: ['The nav is labelled Connected controllers and each entry announces whether the pad is connected.'],
  buildingBlock: true,
  example: `import { ControllerPads } from '@app/views/ControllerPads';\n\nconst Connected = () => <ControllerPads onRunDiagnostics={(deviceKey) => void deviceKey} />;\n`,
  propsHash: '2a01caa88fcd085a',
} satisfies ComponentUsage;

export { usage };
