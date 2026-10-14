/* @layer site-kit @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A button that starts sign-in or account linking with one provider, with the brand mark of that provider.',
  useWhen: [
    'The sign-in page, one button per provider.',
    'The account page, to link a provider that is not linked yet.',
  ],
  avoidWhen: [{ case: 'Any button that does not start an auth flow.', use: 'Button' }],
  rules: [
    'Pass intent as signin or link, and returnTo as the path to come back to.',
    'Set fullWidth when the buttons stack in a narrow card.',
  ],
  a11y: ['The label names the verb and the provider, so the mark is decoration.'],
  buildingBlock: true,
  example: `import { ProviderButton } from '@rotp/design';\n\nconst DiscordSignIn = () => <ProviderButton provider="discord" intent="signin" returnTo="/" fullWidth />;\n`,
  propsHash: 'bda3af8ef287bce5',
} satisfies ComponentUsage;

export { usage };
