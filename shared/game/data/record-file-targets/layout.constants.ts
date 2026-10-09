/* @layer shared-game @kind constants */
const AREA_FOLDERS: Readonly<Record<string, string>> = {
  'area-001': 'central-hyrule',
  'area-002': 'dark-death-mountain',
  'area-003': 'dark-east',
  'area-004': 'dark-lake-hylia',
  'area-005': 'dark-mire',
  'area-006': 'dark-north',
  'area-007': 'dark-south',
  'area-008': 'death-mountain',
  'area-009': 'desert',
  'area-010': 'east-hyrule',
  'area-011': 'hyrule-castle',
  'area-012': 'kakariko',
  'area-013': 'lake-hylia',
  'area-014': 'lost-woods',
  'area-015': 'skull-woods',
  'area-016': 'south-hyrule',
  'area-017': 'village-of-outcasts',
};

const DUNGEON_FLOORS: Readonly<Record<string, readonly (readonly [string, readonly number[]])[]>> = {
  'hyrule-castle': [['floor-0', [0]], ['floor-b1', [-1]], ['floor-b2', [-2]]],
  'castle-tower': [['floors', [0, 1, 2, 3, 4, 5, 6]]],
  'eastern-palace': [['floor-0', [0]], ['floor-1', [1]]],
  'desert-palace': [['floor-0', [0]], ['floor-b1', [-1]]],
  'tower-of-hera': [['floors', [-1, 0, 1, 2, 3, 4, 5]]],
  'palace-of-darkness': [['floor-0', [0]], ['floor-b1', [-1]], ['floor-b2', [-2]]],
  'swamp-palace': [['floor-0', [0]], ['floor-b1', [-1]]],
  'thieves-town': [['floor-0', [0]], ['floor-b1', [-1]], ['floor-b2', [-2]]],
  'ice-palace': [['floor-0-b1', [0, -1]], ['floor-b2-b3', [-2, -3]], ['floor-b4-b7', [-4, -5, -6, -7]]],
  'misery-mire': [['floor-0', [0]], ['floor-b1', [-1]], ['floor-b2', [-2]]],
  'turtle-rock': [['floor-0', [0]], ['floor-b1', [-1]], ['floor-b2', [-2]]],
  'ganons-tower': [['floor-b2-b1', [-2, -1]], ['floor-0', [0]], ['floor-1-2', [1, 2]], ['floor-3-6', [3, 4, 5, 6]]],
};

const SPLIT_BY_HALF: Readonly<Record<string, readonly string[]>> = {
  'skull-woods': ['front', 'back'],
};

const PLACELESS = 'interiors/special';

export { AREA_FOLDERS, DUNGEON_FLOORS, PLACELESS, SPLIT_BY_HALF };
