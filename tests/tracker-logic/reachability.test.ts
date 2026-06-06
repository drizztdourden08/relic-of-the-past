/* @layer tests @kind test */
/**
 * Tracker logic reachability tests.
 *
 * Verifies that the BFS + screen rules produce correct reachability
 * with various inventory states. Key assertion: with an empty inventory
 * at game start, the number of reachable checks should be reasonable
 * (not inflated by missing rules or name collisions).
 *
 * Run: npx vitest run tests/tracker-logic/reachability.test.ts
 */
import { describe, it, expect } from 'vitest';
import { getReachableScreens, getAccessibleChecks } from '../../shared/game/logic/eval';
import { ALL_CONNECTIONS } from '../../shared/game/data/connections';
import { ALL_CHECKS } from '../../shared/game/checks';
import { SCREEN_RULES, CHECK_RULES } from '../../shared/game/logic';

describe('Tracker Reachability — Empty Inventory', () => {
  const emptyInventory = new Set<string>();
  const noCompletedChecks = new Set<string>();

  it('should not reach any Dark World screens with empty inventory', () => {
    const reachable = getReachableScreens(emptyInventory, ALL_CONNECTIONS, SCREEN_RULES);

    const darkWorldScreens = [
      'east-dark-world',
      'south-dark-world',
      'west-dark-world',
      'northeast-dark-world',
      'dark-desert',
      'dark-lake-hylia',
      'dark-death-mountain-top',
      'dark-death-mountain-west-bottom',
      'dark-death-mountain-east-bottom',
      'skull-woods-forest',
      'bumper-cave-entrance',
      'catfish',
    ];

    for (const screenId of darkWorldScreens) {
      expect(reachable.has(screenId), `${screenId} should NOT be reachable`).toBe(false);
    }
  });

  it('should not reach Dark Death Mountain from Death Mountain teleporters without Moon Pearl', () => {
    const reachable = getReachableScreens(emptyInventory, ALL_CONNECTIONS, SCREEN_RULES);

    expect(reachable.has('dark-death-mountain-top')).toBe(false);
    expect(reachable.has('dark-death-mountain-east-bottom')).toBe(false);
  });

  it('should reach Light World and basic caves from Menu', () => {
    const reachable = getReachableScreens(emptyInventory, ALL_CONNECTIONS, SCREEN_RULES);

    expect(reachable.has('menu')).toBe(true);
    expect(reachable.has('light-world')).toBe(true);
    expect(reachable.has('sanctuary')).toBe(true);
    expect(reachable.has('links-house')).toBe(true);
    expect(reachable.has('blinds-hideout')).toBe(true);
    expect(reachable.has('kakariko-well-top')).toBe(true);
    expect(reachable.has('sahasrahlas-hut')).toBe(true);
  });

  it('should NOT reach bomb-gated caves without bombs', () => {
    const reachable = getReachableScreens(emptyInventory, ALL_CONNECTIONS, SCREEN_RULES);

    expect(reachable.has('mini-moldorm-cave')).toBe(false);
    expect(reachable.has('ice-rod-cave')).toBe(false);
    expect(reachable.has('light-world-bomb-hut')).toBe(false);
  });

  it('should NOT reach Castle Tower without a sword', () => {
    const reachable = getReachableScreens(emptyInventory, ALL_CONNECTIONS, SCREEN_RULES);

    expect(reachable.has('agahnims-tower')).toBe(false);
  });

  it('should NOT reach Pyramid Ledge DW via the LW name collision', () => {
    const reachable = getReachableScreens(emptyInventory, ALL_CONNECTIONS, SCREEN_RULES);

    // The LW version should be reachable (renamed to avoid collision)
    expect(reachable.has('pyramid-ledge-lw')).toBe(true);
    // The DW version should NOT be reachable
    expect(reachable.has('pyramid-ledge')).toBe(false);
  });

  it('reachable checks with empty inventory should be <= 55', () => {
    const accessible = getAccessibleChecks(
      emptyInventory,
      noCompletedChecks,
      ALL_CHECKS,
      ALL_CONNECTIONS,
      SCREEN_RULES,
      CHECK_RULES,
    );

    // With no items at all, checks in freely-reachable LW caves,
    // Death Mountain (via Old Man S&Q), and Hyrule Castle are available.
    // Open-mode allows ~51 due to DM access + event checks. The key fix was reducing
    // from 64+ (which included false DW access) to this level.
    expect(accessible.length).toBeLessThanOrEqual(54);
    // Should NOT include any Dark World checks
    const dwChecks = accessible.filter(c => [
      'east-dark-world', 'south-dark-world', 'west-dark-world',
      'northeast-dark-world', 'catfish', 'dark-desert',
    ].includes(c.screen));
    expect(dwChecks.length).toBe(0);

    // Log for debugging
    console.log(`Reachable checks with empty inventory: ${accessible.length}`);
    console.log('Checks:', accessible.map(c => c.id).sort());
  });

  it('should not have more than 80 reachable screens with empty inventory (open-mode)', () => {
    const reachable = getReachableScreens(emptyInventory, ALL_CONNECTIONS, SCREEN_RULES);

    // Log for analysis
    console.log(`Reachable screens with empty inventory: ${reachable.size}`);
    console.log('Regions:', [...reachable].sort());

    // Open-mode: Old Man S&Q opens Death Mountain chain (~77 regions).
    // This is correct for randomizer open mode. Vanilla mode (Phase 3)
    // will gate S&Q destinations and reduce this to ~20.
    expect(reachable.size).toBeLessThanOrEqual(80);
    expect(reachable.size).toBeGreaterThan(60); // Sanity: DM chain should be accessible
  });
});

describe('Tracker Reachability — With Items', () => {
  it('should reach Death Mountain with Power Glove', () => {
    const inventory = new Set(['Power Glove']);
    const reachable = getReachableScreens(inventory, ALL_CONNECTIONS, SCREEN_RULES);

    expect(reachable.has('death-mountain')).toBe(true);
    expect(reachable.has('death-mountain-top')).toBe(true);
  });

  it('should reach Dark World with Moon Pearl + Hammer + Power Glove (via East Hyrule Teleporter)', () => {
    const inventory = new Set(['Moon Pearl', 'Hammer', 'Power Glove']);
    const reachable = getReachableScreens(inventory, ALL_CONNECTIONS, SCREEN_RULES);

    expect(reachable.has('east-dark-world')).toBe(true);
    expect(reachable.has('south-dark-world')).toBe(true);
  });

  it('should reach Dark Death Mountain with Moon Pearl + Power Glove (via DM teleporter)', () => {
    const inventory = new Set(['Moon Pearl', 'Power Glove']);
    const reachable = getReachableScreens(inventory, ALL_CONNECTIONS, SCREEN_RULES);

    expect(reachable.has('death-mountain-top')).toBe(true);
    expect(reachable.has('dark-death-mountain-top')).toBe(true);
  });

  it('should NOT reach Dark Death Mountain without Moon Pearl even with Power Glove', () => {
    const inventory = new Set(['Power Glove']);
    const reachable = getReachableScreens(inventory, ALL_CONNECTIONS, SCREEN_RULES);

    expect(reachable.has('death-mountain-top')).toBe(true);
    expect(reachable.has('dark-death-mountain-top')).toBe(false);
  });

  it('should reach Northeast Dark World only with Hammer from East DW', () => {
    const inventory = new Set(['Moon Pearl', 'Hammer', 'Power Glove']);
    const reachable = getReachableScreens(inventory, ALL_CONNECTIONS, SCREEN_RULES);

    expect(reachable.has('northeast-dark-world')).toBe(true);
    expect(reachable.has('catfish')).toBe(true);
  });

  it('should NOT reach Northeast Dark World without Hammer', () => {
    const inventory = new Set(['Moon Pearl', 'Titans Mitts']);
    const reachable = getReachableScreens(inventory, ALL_CONNECTIONS, SCREEN_RULES);

    // Kakariko Teleporter: canLiftHeavyRocks + Moon Pearl → West Dark World
    expect(reachable.has('west-dark-world')).toBe(true);
    // West DW drops to South DW, but East DW needs Hammer (bridge) or Flippers (river pier)
    expect(reachable.has('east-dark-world')).toBe(false);
    // And therefore NE DW unreachable
    expect(reachable.has('northeast-dark-world')).toBe(false);
  });

  it('Mirror spots should require Magic Mirror', () => {
    const inventory = new Set(['Moon Pearl', 'Hammer', 'Power Glove']);
    const reachable = getReachableScreens(inventory, ALL_CONNECTIONS, SCREEN_RULES);

    expect(reachable.has('east-dark-world')).toBe(true);
    expect(reachable.has('south-dark-world')).toBe(true);
    // Maze Race Ledge via Maze Race Mirror Spot requires Mirror
    expect(reachable.has('maze-race-ledge')).toBe(false);
  });
});

describe('Tracker Reachability — Dungeon Access', () => {
  it('should reach Tower of Hera (Bottom) from Death Mountain Top (free)', () => {
    const inventory = new Set(['Power Glove']);
    const reachable = getReachableScreens(inventory, ALL_CONNECTIONS, SCREEN_RULES);

    expect(reachable.has('death-mountain-top')).toBe(true);
    expect(reachable.has('tower-of-hera-bottom')).toBe(true);
  });

  it('should reach Desert Palace via Book of Mudora', () => {
    const inventory = new Set(['Book of Mudora']);
    const reachable = getReachableScreens(inventory, ALL_CONNECTIONS, SCREEN_RULES);

    expect(reachable.has('desert-palace-stairs')).toBe(true);
    expect(reachable.has('desert-palace-entrance-north-spot')).toBe(true);
    expect(reachable.has('desert-palace-north')).toBe(true);
  });

  it('should reach Swamp Palace entrance with proper DW access + Flippers', () => {
    const inventory = new Set(['Moon Pearl', 'Hammer', 'Power Glove', 'Flippers', 'Magic Mirror']);
    const reachable = getReachableScreens(inventory, ALL_CONNECTIONS, SCREEN_RULES);

    expect(reachable.has('south-dark-world')).toBe(true);
    expect(reachable.has('swamp-palace-entrance')).toBe(true);
  });

  it('should reach Skull Woods First Section with Moon Pearl + DW access', () => {
    const inventory = new Set(['Moon Pearl', 'Titans Mitts']);
    const reachable = getReachableScreens(inventory, ALL_CONNECTIONS, SCREEN_RULES);

    expect(reachable.has('skull-woods-forest')).toBe(true);
    expect(reachable.has('skull-woods-first-section')).toBe(true);
  });

  it('should reach Ganons Tower entrance with 7 crystals', () => {
    const inventory = new Set([
      'Moon Pearl', 'Power Glove',
      'Crystal 1', 'Crystal 2', 'Crystal 3', 'Crystal 4',
      'Crystal 5', 'Crystal 6', 'Crystal 7',
    ]);
    const reachable = getReachableScreens(inventory, ALL_CONNECTIONS, SCREEN_RULES);

    expect(reachable.has('dark-death-mountain-top')).toBe(true);
    expect(reachable.has('ganons-tower-entrance')).toBe(true);
  });

  it('should NOT reach Ganons Tower entrance without 7 crystals', () => {
    const inventory = new Set([
      'Moon Pearl', 'Power Glove',
      'Crystal 1', 'Crystal 2', 'Crystal 3', 'Crystal 4',
      'Crystal 5', 'Crystal 6', // only 6
    ]);
    const reachable = getReachableScreens(inventory, ALL_CONNECTIONS, SCREEN_RULES);

    expect(reachable.has('dark-death-mountain-top')).toBe(true);
    expect(reachable.has('ganons-tower-entrance')).toBe(false);
  });

  it('should reach Misery Mire entrance with sword + Ether + DW access', () => {
    const inventory = new Set([
      'Moon Pearl', 'Titans Mitts', 'Activated Flute',
      'Fighter Sword', 'Ether',
    ]);
    const reachable = getReachableScreens(inventory, ALL_CONNECTIONS, SCREEN_RULES);

    expect(reachable.has('dark-desert')).toBe(true);
    expect(reachable.has('misery-mire-entrance')).toBe(true);
  });

  it('should reach Turtle Rock entrance with sword + Quake + Moon Pearl', () => {
    const inventory = new Set([
      'Moon Pearl', 'Power Glove',
      'Fighter Sword', 'Quake',
    ]);
    const reachable = getReachableScreens(inventory, ALL_CONNECTIONS, SCREEN_RULES);

    expect(reachable.has('turtle-rock-top')).toBe(true);
    expect(reachable.has('turtle-rock-entrance')).toBe(true);
  });
});
