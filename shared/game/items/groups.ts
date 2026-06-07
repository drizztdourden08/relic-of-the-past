/* @layer shared-game @kind logic */
const ITEM_GROUPS: Record<string, string[]> = {
  Swords: ['Fighter Sword', 'Master Sword', 'Tempered Sword', 'Golden Sword'],
  Bottles: [
    'Bottle',
    'Bottle (Red Potion)',
    'Bottle (Green Potion)',
    'Bottle (Blue Potion)',
    'Bottle (Fairy)',
    'Bottle (Bee)',
    'Bottle (Good Bee)',
  ],
  Crystals: [
    'Crystal 1',
    'Crystal 2',
    'Crystal 3',
    'Crystal 4',
    'Crystal 5',
    'Crystal 6',
    'Crystal 7',
  ],
  Pendants: ['Green Pendant', 'Blue Pendant', 'Red Pendant'],
  Medallions: ['Bombos', 'Ether', 'Quake'],
  Bows: ['Bow', 'Silver Bow', 'Silver Arrows'],
  Gloves: ['Power Glove', 'Titans Mitts'],
};

export { ITEM_GROUPS };
