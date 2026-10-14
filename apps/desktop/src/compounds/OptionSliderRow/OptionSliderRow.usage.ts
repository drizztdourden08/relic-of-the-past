/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A slider row for a numeric randomizer option, with its label, description and formatted value.',
  useWhen: ['Where an option is a number with steps.'],
  avoidWhen: [{ case: 'A number typed in.', use: 'NumberInput' }],
  rules: ['Pass formatValue to write the value; pass readout for a read only tag.'],
  a11y: ['The slider is labelled with the option name.'],
  buildingBlock: true,
  example: `import { OptionSliderRow } from '@app/compounds/OptionSliderRow';

const Mounted = () => <OptionSliderRow label="Price" value={3} min={1} max={9} formatValue={String} />;
`,
  propsHash: '0dd3f47c82e80b07',
} satisfies ComponentUsage;

export { usage };
