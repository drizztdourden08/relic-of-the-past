/* @layer site-kit @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'Sends the visitor to another path of the site as soon as it renders, replacing the current history entry.',
  useWhen: ['A route that only exists to forward to another route.'],
  avoidWhen: [{ case: 'A link the person chooses to follow.', use: 'Link' }],
  rules: ['Render it in a route and nowhere else; it draws nothing.'],
  a11y: ['It draws nothing and replaces the history entry, so the back button does not return to it.'],
  buildingBlock: true,
  example: `import { Redirect } from '@rotp/design';\n\nconst OldPage = () => <Redirect to="/browse" />;\n`,
  propsHash: 'bc1a19222344b8e3',
} satisfies ComponentUsage;

export { usage };
