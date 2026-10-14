/* @layer site-kit @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The name of a Discord role as a tag in the colour of that role.',
  useWhen: ['Listing the roles of a Discord server next to the groups they map to.'],
  avoidWhen: [{ case: 'A tag that has no role colour.', use: 'Tag' }],
  rules: ['Pass the colour as the number Discord returns; zero draws the default tag.'],
  a11y: ['The name is text on the tag, so the role colour carries no meaning on its own.'],
  buildingBlock: true,
  example: `import { RoleName } from '@rotp/design';\n\nconst RoleSample = () => <RoleName name="Artists" color={0x3498db} />;\n`,
  propsHash: '17bbeb9620be973e',
} satisfies ComponentUsage;

export { usage };
