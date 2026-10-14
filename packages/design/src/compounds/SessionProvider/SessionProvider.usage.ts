/* @layer site-kit @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'Loads the session of the signed-in person once and shares it with every part below through the session context.',
  useWhen: ['Once, near the root of a site, above everything that reads useSessionContext.'],
  avoidWhen: [{ case: 'The root of a whole site; SiteKit already includes it.', use: 'Box' }],
  rules: [
    'Do not nest two of them.',
    'Read the session with useSessionContext, never with a second request.',
  ],
  a11y: ['It draws nothing of its own.'],
  buildingBlock: true,
  example: `import { SessionProvider } from '@rotp/design';\n\nconst Root = () => <SessionProvider>{null}</SessionProvider>;\n`,
  propsHash: '1bc5bf568a454eb2',
} satisfies ComponentUsage;

export { usage };
