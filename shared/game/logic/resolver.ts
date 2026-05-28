import type { LogicConfig, Requirement, RegionConnection } from '../types';
import { REGION_RULES } from './region-rules';
import { CHECK_RULES } from './check-rules';
import { ALL_CONNECTIONS } from '../data/connections';
import {
  hasSword, hasBeamSword, hasCrystals,
} from './helpers';

// ─── Vanilla-only intro connection ───
const VANILLA_INTRO_CONNECTION: RegionConnection =
  { from: 'menu', to: 'links-house', tags: [] };

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

  // --- S&Q destination gating (keyed by from|to) ---
  const sqDestinations: Record<string, string> = {
    'links-house': 'menu|links-house',
    'sanctuary': 'menu|sanctuary',
    'old-man-cave': 'menu|old-man-cave',
  };

  for (const [dest, key] of Object.entries(sqDestinations)) {
    if (!config.saveQuitDestinations.includes(dest)) {
      regionRules[key] = getSQGateRequirement(dest, config);
    }
  }

  // --- Vanilla mode: gate progression ---
  if (config.mode === 'vanilla') {
    // Vanilla intro gate (combined with any S&Q rule on same key)
    const introKey = 'menu|links-house';
    const existingSQRule = regionRules[introKey];
    if (existingSQRule) {
      regionRules[introKey] = { or: ['Link Wakes Up', existingSQRule] };
    } else {
      regionRules[introKey] = 'Link Wakes Up';
    }

    regionRules['hyrule-castle-secret-entrance|lw-1b'] = 'Zelda Rescue Started';
    regionRules['links-house|lw-2c'] = 'Rescued Zelda';
    // TODO: these rules need matching connections to function:
    regionRules['lw-1b|hc-south'] = 'Zelda Rescue Started';
    regionRules['lw-1b|hc-east'] = 'Zelda Rescue Started';
    regionRules['lw-1b|hc-west'] = 'Zelda Rescue Started';
    regionRules['lw-1b|ct-0x20'] = hasBeamSword;
  }

  // --- Swordless mode: remove sword requirements from Castle Tower ---
  if (config.swordMode === 'swordless') {
    delete regionRules['lw-1b|ct-0x20'];
  }

  // --- Open mode: Castle Tower accessible with Cape OR Sword ---
  if (config.mode === 'open') {
    regionRules['lw-1b|ct-0x20'] = { or: [hasSword, 'Cape'] };
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

function getSQGateRequirement(dest: string, _config: LogicConfig): Requirement {
  switch (dest) {
    case 'links-house':
      return 'Rescued Zelda';
    case 'sanctuary':
      return 'Rescued Zelda';
    case 'old-man-cave':
      return 'Rescued Old Man';
    default:
      return 'Impossible';
  }
}

export { resolveRules };
export type { ResolvedRules };
