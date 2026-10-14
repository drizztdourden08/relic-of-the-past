/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The randomizer block that sets the shop prices for each currency and bottle content.',
  useWhen: ['In the randomizer settings, as the shop prices section.'],
  avoidWhen: [{ case: 'A list of plain sliders.', use: 'Slider' }],
  rules: ['Pass the option values and the capacity profile; changes return as a patch.'],
  a11y: ['Each row has a check box and a labelled slider.'],
  tree: { path: ['layout', 'a settings screen', 'one section of rows'], rule: 'The shop prices section of the randomizer settings.' },
  example: `import type { ComponentProps } from 'react';
import { ShopPricesBlock } from '@app/compounds/ShopPricesBlock';

const Mounted = (props: ComponentProps<typeof ShopPricesBlock>) => <ShopPricesBlock {...props} />;
`,
  propsHash: 'db28c5e36e5d8d89',
} satisfies ComponentUsage;

export { usage };
