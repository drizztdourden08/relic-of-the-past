/* @layer site-kit @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A pill that names where a person stands with a site: admin, member, pending or revoked.',
  useWhen: ['Next to a person in an account page, the admin queue or any list of site users.'],
  avoidWhen: [{ case: 'A status that is not an access state.', use: 'Status' }],
  rules: ['Pass the access state the hub returned; the label and the tone come from the state.'],
  a11y: ['The pill carries its state as text, so the colour is never the only signal.'],
  buildingBlock: true,
  example: `import { AccessChip } from '@rotp/design';\n\nconst AccessSample = () => <AccessChip state="member" />;\n`,
  propsHash: '6ffa178b3b3b095e',
} satisfies ComponentUsage;

export { usage };
