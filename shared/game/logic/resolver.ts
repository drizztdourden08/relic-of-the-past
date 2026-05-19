import type { LogicConfig, Requirement, RegionConnection } from '../types';
import { REGION_RULES } from './region-rules';
import { CHECK_RULES } from './check-rules';
import { ALL_CONNECTIONS } from '../regions';
import {
  hasSword, hasBeamSword, hasCrystals,
} from './helpers';

// ─── Vanilla-only intro connection ───
const VANILLA_INTRO_CONNECTION: RegionConnection =
  { from: 'menu', to: 'links-house', entrance: 'Vanilla Intro' };

// ─── Rule Resolution ───

interface ResolvedRules {
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
function resolveRules(config: LogicConfig): ResolvedRules {
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
  const allSQEntrances = ['Links House S&Q', 'Sanctuary S&Q', 'Old Man S&Q'];
  const sqEntranceToRegion: Record<string, string> = {
    'Links House S&Q': 'light-world',
    'Sanctuary S&Q': 'sanctuary',
    'Old Man S&Q': 'old-man-cave',
  };

  for (const entrance of allSQEntrances) {
    const targetRegion = sqEntranceToRegion[entrance];
    if (!config.saveQuitDestinations.includes(targetRegion)) {
      regionRules[entrance] = getSQGateRequirement(entrance, config);
    }
  }

  // --- Vanilla mode: gate progression ---
  if (config.mode === 'vanilla') {
    regionRules['Vanilla Intro'] = 'Link Wakes Up';
    regionRules['Secret Passage to Castle'] = 'Zelda Rescue Started';
    regionRules['Hyrule Castle Entrance (South)'] = 'Zelda Rescue Started';
    regionRules['Hyrule Castle Entrance (East)'] = 'Zelda Rescue Started';
    regionRules['Hyrule Castle Entrance (West)'] = 'Zelda Rescue Started';
    regionRules['Throne Room'] = 'Zelda Rescue Started';
    regionRules['Agahnims Tower'] = hasBeamSword;
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
    connections = [...ALL_CONNECTIONS, VANILLA_INTRO_CONNECTION];
  }

  return {
    regionRules,
    checkRules,
    connections,
    startInventory: new Set(config.startingItems),
  };
}

function getSQGateRequirement(entrance: string, _config: LogicConfig): Requirement {
  switch (entrance) {
    case 'Links House S&Q':
      return 'Rescued Zelda';
    case 'Sanctuary S&Q':
      return 'Rescued Zelda';
    case 'Old Man S&Q':
      return 'Rescued Old Man';
    default:
      return 'Impossible';
  }
}

export { resolveRules };
export type { ResolvedRules };
