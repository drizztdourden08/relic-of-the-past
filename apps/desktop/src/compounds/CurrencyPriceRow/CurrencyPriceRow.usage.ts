/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A shop price row with a check box, an optional price range slider and a note when the price is blocked.',
  useWhen: ['In the shop prices block, once for each currency or bottle content.'],
  avoidWhen: [{ case: 'A plain on or off row.', use: 'Toggle' }],
  rules: ['Pass stops and range together or leave both out.', 'Pass blocked with a note to explain why a price is fixed.'],
  a11y: ['The check box and the slider share the row label.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { CurrencyPriceRow } from '@app/compounds/CurrencyPriceRow';

const Mounted = (props: ComponentProps<typeof CurrencyPriceRow>) => <CurrencyPriceRow {...props} />;
`,
  propsHash: '1a7601007b835a28',
} satisfies ComponentUsage;

export { usage };
