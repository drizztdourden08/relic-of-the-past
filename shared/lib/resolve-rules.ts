import type { LogicConfig, Requirement, RegionConnection } from '../types/tracker';
import { REGION_RULES } from '../data/logic/region-rules';
import { CHECK_RULES } from '../data/logic/check-rules';
import { ALL_CONNECTIONS } from '../data/regions';
import {
  hasSword, hasBeamSword, hasCrystals,
} from '../data/logic/helpers';

// ─── Vanilla-only intro connection ───
// In vanilla, the game starts in Link's House (wake up, open chest).
// From there you exit to light-world and walk to the castle.
const VANILLA_INTRO_CONNECTION: RegionConnection =
  { from: 'menu', to: 'links-house', entrance: 'Vanilla Intro' };

// ─── Preset Configs ───

export const VANILLA_CONFIG: LogicConfig = {
  mode: 'vanilla',
  startingRegion: 'menu',
  startingItems: [],
  saveQuitDestinations: [], // No free S&Q at start — all gated behind progression
  moonPearlRequired: true,
  medallionRequirements: { miseryMire: 'Ether', turtleRock: 'Quake' },
  crystalsForGT: 7,
  crystalsForGanon: 7,
  pendantsForPedestal: 3,
  swordMode: 'normal',
  goal: 'ganon',
  overworldShuffle: false,
  dungeonShuffle: false,
  keysanity: false,
  bigKeyShuffle: false,
};

export const OPEN_CONFIG: LogicConfig = {
  mode: 'open',
  startingRegion: 'menu',
  startingItems: [],
  saveQuitDestinations: ['light-world', 'sanctuary', 'old-man-cave'],
  moonPearlRequired: true,
  medallionRequirements: { miseryMire: 'Ether', turtleRock: 'Quake' },
  crystalsForGT: 7,
  crystalsForGanon: 7,
  pendantsForPedestal: 3,
  swordMode: 'normal',
  goal: 'ganon',
  overworldShuffle: false,
  dungeonShuffle: false,
  keysanity: false,
  bigKeyShuffle: false,
};

// ─── Rule Resolution ───

export interface ResolvedRules {
  regionRules: Record<string, Requirement>;
  checkRules: Record<string, Requirement>;
  connections: RegionConnection[];
  startInventory: Set<string>;
}

/**
 * Resolve the logic rules based on a LogicConfig.
 * 
 * This transforms the static rule/connection data based on the mode:
 * - vanilla: only Link's House S&Q, Sanctuary/Old Man gated behind progression
 * - open: free S&Q to Link's House, Sanctuary, Old Man Cave
 * - no-logic: no rules at all (everything reachable)
 */
export function resolveRules(config: LogicConfig): ResolvedRules {
  if (config.mode === 'no-logic') {
    return {
      regionRules: {},
      checkRules: {},
      connections: ALL_CONNECTIONS,
      startInventory: new Set(config.startingItems),
    };
  }

  // Start with the base rules
  const regionRules: Record<string, Requirement> = { ...REGION_RULES };
  const checkRules: Record<string, Requirement> = { ...CHECK_RULES };

  // --- Medallion requirements (config-driven) ---
  regionRules['Misery Mire'] = {
    and: [hasSword, config.medallionRequirements.miseryMire],
  };
  regionRules['Turtle Rock'] = {
    and: [hasSword, config.medallionRequirements.turtleRock, 'Moon Pearl'],
  };

  // --- Crystal requirements (config-driven) ---
  regionRules['Ganons Tower'] = hasCrystals(config.crystalsForGT);

  // --- Pedestal requirement ---
  checkRules['Master Sword Pedestal'] = { count: ['Pendants', config.pendantsForPedestal] };

  // --- S&Q destination gating ---
  // Gate S&Q connections that aren't in the allowed list
  const allSQEntrances = ['Links House S&Q', 'Sanctuary S&Q', 'Old Man S&Q'];
  const sqEntranceToRegion: Record<string, string> = {
    'Links House S&Q': 'light-world',
    'Sanctuary S&Q': 'sanctuary',
    'Old Man S&Q': 'old-man-cave',
  };

  for (const entrance of allSQEntrances) {
    const targetRegion = sqEntranceToRegion[entrance];
    if (!config.saveQuitDestinations.includes(targetRegion)) {
      // Gate this S&Q behind a progression flag
      regionRules[entrance] = getSQGateRequirement(entrance, config);
    }
  }

  // --- Vanilla mode: gate progression ---
  if (config.mode === 'vanilla') {
    // Nothing accessible until Link wakes up (intro cutscene over)
    regionRules['Vanilla Intro'] = 'Link Wakes Up';
    // Castle interior requires Uncle check done (progress_indicator >= 1)
    regionRules['Secret Passage to Castle'] = 'Zelda Rescue Started';
    regionRules['Hyrule Castle Entrance (South)'] = 'Zelda Rescue Started';
    regionRules['Hyrule Castle Entrance (East)'] = 'Zelda Rescue Started';
    regionRules['Hyrule Castle Entrance (West)'] = 'Zelda Rescue Started';
    // Throne Room / sewers also require uncle done
    regionRules['Throne Room'] = 'Zelda Rescue Started';
    // Castle Tower requires Master Sword (magic seal on door)
    regionRules['Agahnims Tower'] = hasBeamSword;
    // Full Light World exit from Link's House requires Rescued Zelda (progress_indicator >= 2)
    regionRules['Links House Exit'] = 'Rescued Zelda';
  }

  // --- Swordless mode: remove sword requirements from Castle Tower ---
  if (config.swordMode === 'swordless') {
    delete regionRules['Agahnims Tower'];
  }

  // --- Open mode: Castle Tower accessible with Cape OR Sword ---
  if (config.mode === 'open') {
    regionRules['Agahnims Tower'] = { or: [hasSword, 'Cape'] };
  }

  // --- Build connections ---
  let connections = ALL_CONNECTIONS;
  if (config.mode === 'vanilla') {
    // Add intro connection: Menu → Link's House
    connections = [...ALL_CONNECTIONS, VANILLA_INTRO_CONNECTION];
  }

  return {
    regionRules,
    checkRules,
    connections,
    startInventory: new Set(config.startingItems),
  };
}

/**
 * Get the requirement to unlock a S&Q destination in vanilla mode.
 * In vanilla:
 * - Links House S&Q (→ light-world free roam) unlocks after rescuing Zelda
 * - Sanctuary S&Q unlocks after rescuing Zelda
 * - Old Man S&Q unlocks after rescuing the Old Man on Death Mountain
 */
function getSQGateRequirement(entrance: string, _config: LogicConfig): Requirement {
  switch (entrance) {
    case 'Links House S&Q':
      // Free roam unlocks after completing the escape sequence
      return 'Rescued Zelda';
    case 'Sanctuary S&Q':
      // Unlocks after completing the escape sequence (rescue Zelda)
      return 'Rescued Zelda';
    case 'Old Man S&Q':
      // Unlocks after finding the Old Man on Death Mountain
      return 'Rescued Old Man';
    default:
      // Should never happen
      return 'Impossible';
  }
}
