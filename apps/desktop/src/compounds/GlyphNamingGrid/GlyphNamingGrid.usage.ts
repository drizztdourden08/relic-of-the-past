/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A grid of the glyphs a language set could not name, each drawn from the set font with a field for its letter and how often it is used.',
  useWhen: ['In the Language Studio, for a set imported from a patched ROM that still has unnamed glyphs.'],
  avoidWhen: [{ case: 'A plain text field with no glyph picture.', use: 'TextInput' }],
  rules: ['Pass only the glyphs still shown by a placeholder, in glyph order.', 'Each field takes one letter.'],
  a11y: ['The cells form a list, each field is labelled with its placeholder, and a problem is written next to the field.'],
  buildingBlock: true,
  example: `import type { ComponentProps } from 'react';
import { GlyphNamingGrid } from '@app/compounds/GlyphNamingGrid';

const Mounted = (props: ComponentProps<typeof GlyphNamingGrid>) => <GlyphNamingGrid {...props} />;
`,
  propsHash: 'c58c3236673f27dd',
} satisfies ComponentUsage;

export { usage };
