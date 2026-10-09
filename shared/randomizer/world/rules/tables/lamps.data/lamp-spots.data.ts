/* @layer shared-game @kind data */
import type { LocationKey } from '../../../location-key.type';

const LAMP_EXITS: readonly string[] = [
  'Misery Mire (Vitreous)',
  'Turtle Rock (Dark Room) (North)',
  'Turtle Rock (Dark Room) (South)',
  'Palace of Darkness Big Key Door',
  'Palace of Darkness Maze Door',
  'Agahnim 1',
  'Old Man Cave Exit (East)',
  'Death Mountain Return Cave Exit (East)',
  'Death Mountain Return Cave Exit (West)',
  'Old Man House Front to Back',
  'Old Man House Back to Front',
];

const LAMP_LOCATIONS: readonly LocationKey[] = [
  'check-149',
  'check-150',
  'check-113',
  'check-114',
  'check-115',
  'check-060',
  'check-123',
  'check-124',
  'check-119',
  'check-121',
  'check-122',
];

const ESCAPE_DARK_EXITS: readonly string[] = ['Sewers Back Door', 'Throne Room'];

const ESCAPE_DARK_LOCATIONS: readonly LocationKey[] = ['check-103'];

export { ESCAPE_DARK_EXITS, ESCAPE_DARK_LOCATIONS, LAMP_EXITS, LAMP_LOCATIONS };
