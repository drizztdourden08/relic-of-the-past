import type { LogicConfig, Requirement, ScreenConnection } from '../types';
import { SCREEN_RULES } from './screen-rules';
import { CHECK_RULES } from './check-rules';
import { ALL_CONNECTIONS } from '../data/connections';
import {
  hasSword, hasBeamSword, hasCrystals,
} from './helpers';

// ─── Vanilla-only intro connection ───
const VANILLA_INTRO_CONNECTION: ScreenConnection =
  { from: 'menu', to: 'links-house', tags: [] };

// ─── Rule Resolution ───

interface ResolvedRules {
  screenRules: Record<string, Requirement>;
  checkRules: Record<string, Requirement>;
  connections: ScreenConnection[];
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
      screenRules: {},
      checkRules: {},
      connections: ALL_CONNECTIONS,
      startInventory: new Set(config.startingItems),
    };
  }

  // Start with the base rules
  const screenRules: Record<string, Requirement> = { ...SCREEN_RULES };
  const checkRules: Record<string, Requirement> = { ...CHECK_RULES };

  // --- Medallion requirements (config-driven) ---
  screenRules['Misery Mire'] = {
    and: [hasSword, config.medallionRequirements.miseryMire],
  };
  screenRules['Turtle Rock'] = {
    and: [hasSword, config.medallionRequirements.turtleRock, 'Moon Pearl'],
  };

  // --- Crystal requirements (config-driven) ---
  screenRules['Ganons Tower'] = hasCrystals(config.crystalsForGT);

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
      screenRules[key] = getSQGateRequirement(dest, config);
    }
  }

  // --- Vanilla mode: gate progression ---
  if (config.mode === 'vanilla') {
    // Vanilla intro gate (combined with any S&Q rule on same key)
    const introKey = 'menu|links-house';
    const existingSQRule = screenRules[introKey];
    if (existingSQRule) {
      screenRules[introKey] = { or: ['Link Wakes Up', existingSQRule] };
    } else {
      screenRules[introKey] = 'Link Wakes Up';
    }

    screenRules['hyrule-castle-secret-entrance|lw-1b'] = 'Zelda Rescue Started';
    screenRules['links-house|lw-2c'] = 'Rescued Zelda';
    // TODO: these rules need matching connections to function:
    screenRules['lw-1b|hc-south'] = 'Zelda Rescue Started';
    screenRules['lw-1b|hc-east'] = 'Zelda Rescue Started';
    screenRules['lw-1b|hc-west'] = 'Zelda Rescue Started';
    screenRules['lw-1b|ct-0x20'] = hasBeamSword;
  }

  // --- Swordless mode: remove sword requirements from Castle Tower ---
  if (config.swordMode === 'swordless') {
    delete screenRules['lw-1b|ct-0x20'];
  }

  // --- Open mode: Castle Tower accessible with Cape OR Sword ---
  if (config.mode === 'open') {
    screenRules['lw-1b|ct-0x20'] = { or: [hasSword, 'Cape'] };
  }

  // --- Build connections ---
  let connections = ALL_CONNECTIONS;
  if (config.mode === 'vanilla') {
    connections = [...ALL_CONNECTIONS, VANILLA_INTRO_CONNECTION];
  }

  return {
    screenRules,
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
