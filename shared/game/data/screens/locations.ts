/* @layer shared-game @kind data */
/**
 * Location registry — structural groups within areas.
 * Each location belongs to exactly one area.
 * New locations can be added via the Screen Editor wizard.
 */

interface LocationDef {
  id: string;
  name: string;
  areaId: string;
}

const LOCATIONS: LocationDef[] = [
  // Central Hyrule
  { id: 'central-hyrule', name: 'Central Hyrule', areaId: 'central-hyrule' },
  { id: 'sanctuary', name: 'Sanctuary', areaId: 'central-hyrule' },

  // Hyrule Castle
  { id: 'hyrule-castle', name: 'Hyrule Castle', areaId: 'hyrule-castle' },
  { id: 'castle-tower', name: 'Castle Tower', areaId: 'hyrule-castle' },

  // East Hyrule
  { id: 'eastern-hyrule', name: 'Eastern Hyrule', areaId: 'east-hyrule' },
  { id: 'eastern-palace', name: 'Eastern Palace', areaId: 'east-hyrule' },

  // South Hyrule
  { id: 'south-hyrule', name: 'South Hyrule', areaId: 'south-hyrule' },
  { id: 'lake-hylia', name: 'Lake Hylia', areaId: 'lake-hylia' },

  // Kakariko
  { id: 'kakariko-village', name: 'Kakariko Village', areaId: 'kakariko' },

  // Lost Woods
  { id: 'lost-woods', name: 'Lost Woods', areaId: 'lost-woods' },

  // Death Mountain
  { id: 'death-mountain', name: 'Death Mountain', areaId: 'death-mountain' },
  { id: 'tower-of-hera', name: 'Tower of Hera', areaId: 'death-mountain' },

  // Desert
  { id: 'desert-of-mystery', name: 'Desert of Mystery', areaId: 'desert' },
  { id: 'desert-palace', name: 'Desert Palace', areaId: 'desert' },

  // Dark North
  { id: 'dark-central', name: 'Dark Central', areaId: 'dark-north' },
  { id: 'dark-sanctuary', name: 'Dark Sanctuary', areaId: 'dark-north' },
  { id: 'pyramid-of-power', name: 'Pyramid of Power', areaId: 'dark-north' },

  // Dark East
  { id: 'dark-eastern', name: 'Dark Eastern', areaId: 'dark-east' },
  { id: 'palace-of-darkness', name: 'Palace of Darkness', areaId: 'dark-east' },

  // Dark South
  { id: 'dark-south', name: 'Dark South', areaId: 'dark-south' },
  { id: 'swamp-of-evil', name: 'Swamp of Evil', areaId: 'dark-south' },
  { id: 'swamp-palace', name: 'Swamp Palace', areaId: 'dark-south' },

  // Dark Mire
  { id: 'misery-mire', name: 'Misery Mire', areaId: 'dark-mire' },

  // Dark Lake Hylia
  { id: 'dark-lake', name: 'Dark Lake', areaId: 'dark-lake-hylia' },
  { id: 'ice-palace', name: 'Ice Palace', areaId: 'dark-lake-hylia' },

  // Dark Death Mountain
  { id: 'dark-death-mountain', name: 'Dark Death Mountain', areaId: 'dark-death-mountain' },
  { id: 'ganons-tower', name: "Ganon's Tower", areaId: 'dark-death-mountain' },
  { id: 'turtle-rock', name: 'Turtle Rock', areaId: 'dark-death-mountain' },

  // Skull Woods Area
  { id: 'skull-woods', name: 'Skull Woods', areaId: 'skull-woods-area' },

  // Village of Outcasts
  { id: 'village-of-outcasts', name: 'Village of Outcasts', areaId: 'village-of-outcasts' },
  { id: 'thieves-town', name: "Thieves' Town", areaId: 'village-of-outcasts' },
];

export { LOCATIONS };
export type { LocationDef };
