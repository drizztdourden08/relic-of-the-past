/* @layer site-kit @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The sign-in page of a site: a Gate with one sign-in button per provider.',
  useWhen: ['The page RouteGuard shows to a signed-out visitor, or any page that asks a visitor to sign in.'],
  avoidWhen: [{ case: 'Linking a provider from the account page.', use: 'Button' }],
  rules: [
    'Pass a lead of one or two lines that says what the site is for.',
    'Pass returnTo to bring the person back to the page they asked for.',
  ],
  a11y: ['It is the main landmark of the page, with the card title as its heading, and each button names its provider.'],
  buildingBlock: true,
  example: `import { SignIn } from '@rotp/design';\n\nconst Welcome = () => <SignIn lead="Sign in to share packs." returnTo="/" />;\n`,
  propsHash: 'b8dc9f6e34a57652',
} satisfies ComponentUsage;

export { usage };
