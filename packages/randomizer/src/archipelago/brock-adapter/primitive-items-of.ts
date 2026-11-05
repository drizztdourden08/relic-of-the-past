/* @layer shared-game @kind logic */
import type { PrimitiveData } from '../export/export.type';

const familyItems = (data: PrimitiveData, id: keyof PrimitiveData['families']): string[] =>
  [...data.families[id].jumpItems, data.families[id].progressiveItem];

const primitiveItemsOf = (data: PrimitiveData) => (name: string): readonly string[] => {
  const { hearts } = data;
  const meter = [...familyItems(data, 'meter'), data.meterHalf, data.meterQuarter];
  switch (name) {
    case 'explosivesAtLeast': return [...familyItems(data, 'explosives'), ...familyItems(data, 'wallet')];
    case 'projectilesAtLeast': return [...familyItems(data, 'projectiles'), ...familyItems(data, 'wallet')];
    case 'walletAtLeast': return familyItems(data, 'wallet');
    case 'heartCapacityAbove':
    case 'hasHearts': return [hearts.container, hearts.sanctuary, hearts.piece];
    case 'canExtendMagic': return [...meter, ...data.bottles];
    default: return [];
  }
};

export { primitiveItemsOf };
