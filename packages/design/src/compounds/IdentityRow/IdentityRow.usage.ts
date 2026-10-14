/* @layer site-kit @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'One sign-in provider of the account: the linked handle with an Unlink button, or a Link button when the provider is not linked yet.',
  useWhen: ['In the list of sign-in providers of an account page, one row per provider.'],
  avoidWhen: [{ case: 'A sign-in button on a page before sign-in.', use: 'Button' }],
  rules: [
    'Render it inside a ListItemList.',
    'Set canUnlink to false for the last linked provider, so the person keeps a way in.',
  ],
  a11y: ['Both buttons are native buttons, and a disabled Unlink stays in the tab order of the row text.'],
  buildingBlock: true,
  example: `import { IdentityRow } from '@rotp/design';\n\nconst IdentitySample = () => <IdentityRow provider="discord" identity={null} canUnlink={false} busy={false} onUnlink={() => undefined} />;\n`,
  propsHash: 'ee51341269bccb24',
} satisfies ComponentUsage;

export { usage };
