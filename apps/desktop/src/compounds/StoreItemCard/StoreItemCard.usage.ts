/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'A card for one Hookshop item: its picture, kind, name, author with version, star rating and an installed or update mark.',
  useWhen: ['In the grids of the Hookshop screens, one card per item.'],
  avoidWhen: [{ case: 'A row in a table of items.', use: 'ListItemRow' }],
  rules: [
    'Pass the picture url, or null to show the icon of the kind.',
    'Set status to installed or update from the local library, and selected for the open item.',
  ],
  a11y: ['The card is a button that reports whether it is pressed; Enter and Space select it.'],
  buildingBlock: true,
  example: `import { StoreItemCard } from '@app/compounds/StoreItemCard';\nimport type { ItemCardView } from '@rotp/hub-contracts';\n\nconst Card = ({ item }: { item: ItemCardView }) => (\n  <StoreItemCard item={item} imageUrl={null} status={null} selected={false} onSelect={() => undefined} />\n);\n`,
  propsHash: '313e83246404ebf8',
} satisfies ComponentUsage;

export { usage };
