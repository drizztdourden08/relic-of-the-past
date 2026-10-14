/* @layer site-kit @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'One signed-in device of the account: its platform, its label, when it was added and last seen, and a Revoke button.',
  useWhen: ['In the list of signed-in devices of an account page.'],
  avoidWhen: [{ case: 'A row that is not a device.', use: 'ListItemRow' }],
  rules: [
    'Render it inside a ListItemList.',
    'Disable it with busy while a revoke request runs, and revoke by the device id it hands back.',
  ],
  a11y: ['The Revoke button is a native button inside the row, and it is the only control.'],
  buildingBlock: true,
  example: `import { DeviceRow } from '@rotp/design';\nimport type { Device } from '@rotp/hub-contracts';\n\nconst DeviceSample = ({ device }: { device: Device }) => <DeviceRow device={device} busy={false} onRevoke={() => undefined} />;\n`,
  propsHash: '8fe9eaec9ff4f30c',
} satisfies ComponentUsage;

export { usage };
