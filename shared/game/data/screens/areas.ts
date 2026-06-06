/**
 * Area registry — broad geographic zones.
 * Each area groups multiple locations under one filterable region.
 * New areas can be added via the Screen Editor wizard.
 */

interface AreaDef {
  id: string;
  name: string;
  world: 'light' | 'dark' | 'both';
}

const AREAS: AreaDef[] = [
  // Light World
  { id: 'central-hyrule', name: 'Central Hyrule', world: 'light' },
  { id: 'hyrule-castle', name: 'Hyrule Castle', world: 'light' },
  { id: 'east-hyrule', name: 'East Hyrule', world: 'light' },
  { id: 'south-hyrule', name: 'South Hyrule', world: 'light' },
  { id: 'kakariko', name: 'Kakariko', world: 'light' },
  { id: 'lost-woods', name: 'Lost Woods', world: 'light' },
  { id: 'death-mountain', name: 'Death Mountain', world: 'both' },
  { id: 'desert', name: 'Desert', world: 'light' },
  { id: 'lake-hylia', name: 'Lake Hylia', world: 'light' },
  // Dark World
  { id: 'dark-north', name: 'Dark North', world: 'dark' },
  { id: 'dark-east', name: 'Dark East', world: 'dark' },
  { id: 'dark-south', name: 'Dark South', world: 'dark' },
  { id: 'dark-mire', name: 'Dark Mire', world: 'dark' },
  { id: 'dark-lake-hylia', name: 'Dark Lake Hylia', world: 'dark' },
  { id: 'dark-death-mountain', name: 'Dark Death Mountain', world: 'dark' },
  { id: 'skull-woods-area', name: 'Skull Woods Area', world: 'dark' },
  { id: 'village-of-outcasts', name: 'Village Of Outcasts', world: 'dark' },
];

export { AREAS };
export type { AreaDef };
