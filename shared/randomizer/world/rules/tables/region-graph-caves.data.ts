/* @layer shared-game @kind data */
/**
 * The reachability graph of the caves and the houses: one row per passage out of a region.
 *
 * A row is a RULE, not a place. The exit name is the key the rule tables hang their
 * requirement off, and `connectionId` names the crossing the map draws for it when exactly
 * one crossing of the record collection joins the same pair of regions. Where none does, or
 * where several do, the row carries none: a mirror spot, a retry from the menu and a wing
 * boundary inside one room cross no tile at all, and a pair joined by two doors cannot say
 * which of them this passage is.
 *
 * Folded from Archipelago worlds/alttp/Regions.py (create_regions, the exits of each region)
 * and EntranceShuffle.py (mandatory_connections, default_connections,
 * default_dungeon_connections), open mode with entrance shuffle off.
 */
import type { RegionGraphRow } from '../../region.type';

const CAVE_REGION_GRAPH: readonly RegionGraphRow[] = [
  { from: 'region-059', to: 'region-019', exit: 'Hyrule Castle Secret Entrance Exit', connectionId: 'connection-1602' },
  { from: 'region-062', to: 'region-002', exit: 'North Fairy Cave Exit', connectionId: 'connection-1634' },
  { from: 'region-064', to: 'region-002', exit: 'Links House Exit' },
  { from: 'region-065', to: 'region-064', exit: 'Chris Houlihan Room Exit' },
  { from: 'region-067', to: 'region-002', exit: 'Elder House Exit (East)' },
  { from: 'region-067', to: 'region-002', exit: 'Elder House Exit (West)' },
  { from: 'region-089', to: 'region-090', exit: 'Kakariko Well (top to bottom)', connectionId: 'connection-406' },
  { from: 'region-090', to: 'region-002', exit: 'Kakariko Well Exit', connectionId: 'connection-407' },
  { from: 'region-092', to: 'region-093', exit: 'Bat Cave Door', connectionId: 'connection-311' },
  { from: 'region-093', to: 'region-002', exit: 'Bat Cave Exit', connectionId: 'connection-312' },
  { from: 'region-095', to: 'region-096', exit: 'Lost Woods Hideout (top to bottom)', connectionId: 'connection-326' },
  { from: 'region-096', to: 'region-002', exit: 'Lost Woods Hideout Exit', connectionId: 'connection-327' },
  { from: 'region-097', to: 'region-098', exit: 'Lumberjack Tree (top to bottom)', connectionId: 'connection-328' },
  { from: 'region-098', to: 'region-002', exit: 'Lumberjack Tree Exit', connectionId: 'connection-329' },
  { from: 'region-114', to: 'region-002', exit: 'Two Brothers House Exit (East)' },
  { from: 'region-114', to: 'region-012', exit: 'Two Brothers House Exit (West)', connectionId: 'connection-374' },
  { from: 'region-117', to: 'region-021', exit: 'Old Man Cave Exit (East)' },
  { from: 'region-117', to: 'region-002', exit: 'Old Man Cave Exit (West)' },
  { from: 'region-118', to: 'region-021', exit: 'Old Man House Exit (Bottom)', connectionId: 'connection-1425' },
  { from: 'region-118', to: 'region-119', exit: 'Old Man House Front to Back', connectionId: 'connection-371' },
  { from: 'region-119', to: 'region-021', exit: 'Old Man House Exit (Top)' },
  { from: 'region-119', to: 'region-118', exit: 'Old Man House Back to Front', connectionId: 'connection-1426' },
  { from: 'region-120', to: 'region-022', exit: 'Death Mountain Return Cave Exit (West)', connectionId: 'connection-1609' },
  { from: 'region-120', to: 'region-021', exit: 'Death Mountain Return Cave Exit (East)', connectionId: 'connection-1628' },
  { from: 'region-121', to: 'region-122', exit: 'Spectacle Rock Cave Drop' },
  { from: 'region-121', to: 'region-021', exit: 'Spectacle Rock Cave Exit (Top)', connectionId: 'connection-1305' },
  { from: 'region-122', to: 'region-021', exit: 'Spectacle Rock Cave Exit', connectionId: 'connection-1605' },
  { from: 'region-123', to: 'region-122', exit: 'Spectacle Rock Cave Peak Drop' },
  { from: 'region-123', to: 'region-021', exit: 'Spectacle Rock Cave Exit (Peak)' },
  { from: 'region-125', to: 'region-126', exit: 'Paradox Cave Push Block Reverse', connectionId: 'connection-334' },
  { from: 'region-125', to: 'region-023', exit: 'Paradox Cave Exit (Bottom)', connectionId: 'connection-1306' },
  { from: 'region-125', to: 'region-128', exit: 'Light World Death Mountain Shop' },
  { from: 'region-126', to: 'region-125', exit: 'Paradox Cave Push Block', connectionId: 'connection-335' },
  { from: 'region-126', to: 'region-127', exit: 'Paradox Cave Bomb Jump', connectionId: 'connection-1308' },
  { from: 'region-127', to: 'region-023', exit: 'Paradox Cave Exit (Middle)' },
  { from: 'region-127', to: 'region-024', exit: 'Paradox Cave Exit (Top)', connectionId: 'connection-336' },
  { from: 'region-127', to: 'region-126', exit: 'Paradox Cave Drop', connectionId: 'connection-337' },
  { from: 'region-129', to: 'region-130', exit: 'Spiral Cave (top to bottom)', connectionId: 'connection-393' },
  { from: 'region-129', to: 'region-025', exit: 'Spiral Cave Exit (Top)', connectionId: 'connection-1307' },
  { from: 'region-130', to: 'region-023', exit: 'Spiral Cave Exit', connectionId: 'connection-394' },
  { from: 'region-131', to: 'region-133', exit: 'Fairy Ascension Cave Climb' },
  { from: 'region-131', to: 'region-026', exit: 'Fairy Ascension Cave Exit (Bottom)', connectionId: 'connection-1611' },
  { from: 'region-132', to: 'region-131', exit: 'Fairy Ascension Cave Pots' },
  { from: 'region-133', to: 'region-027', exit: 'Fairy Ascension Cave Exit (Top)', connectionId: 'connection-1612' },
  { from: 'region-133', to: 'region-132', exit: 'Fairy Ascension Cave Drop', connectionId: 'connection-398' },
  { from: 'region-153', to: 'region-041', exit: 'Bumper Cave Exit (Bottom)' },
  { from: 'region-153', to: 'region-045', exit: 'Bumper Cave Exit (Top)', connectionId: 'connection-899' },
  { from: 'region-156', to: 'region-050', exit: 'Superbunny Cave Exit (Top)', connectionId: 'connection-1272' },
  { from: 'region-157', to: 'region-156', exit: 'Superbunny Cave Climb' },
  { from: 'region-157', to: 'region-053', exit: 'Superbunny Cave Exit (Bottom)', connectionId: 'connection-1273' },
  { from: 'region-159', to: 'region-050', exit: 'Hookshot Cave Exit (South)', connectionId: 'connection-903' },
  { from: 'region-159', to: 'region-160', exit: 'Hookshot Cave Bomb Wall (South)' },
  { from: 'region-160', to: 'region-054', exit: 'Hookshot Cave Exit (North)', connectionId: 'connection-861' },
  { from: 'region-160', to: 'region-159', exit: 'Hookshot Cave Bomb Wall (North)', connectionId: 'connection-860' },
  { from: 'region-162', to: 'region-163', exit: 'Ganon Drop', connectionId: 'connection-893' },
  { from: 'region-163', to: 'region-056', exit: 'Pyramid Exit' },
];

export { CAVE_REGION_GRAPH };
