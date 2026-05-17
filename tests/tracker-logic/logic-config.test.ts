/**
 * Tests for LogicConfig and resolveRules.
 *
 * Verifies that vanilla mode gates progression correctly (very few checks at start),
 * while open mode allows free roaming as before.
 */
import { describe, it, expect } from 'vitest';
import { getReachableRegions, getAccessibleChecks } from '../../shared/lib/logic-eval';
import { resolveRules, VANILLA_CONFIG, OPEN_CONFIG } from '../../shared/lib/resolve-rules';
import { ALL_CHECKS } from '../../shared/data/checks';

describe('LogicConfig — Vanilla Mode', () => {
  const resolved = resolveRules(VANILLA_CONFIG);
  const emptyInventory = new Set<string>(resolved.startInventory);
  const noCompletedChecks = new Set<string>();

  it('should reach only menu before Link Wakes Up', () => {
    const reachable = getReachableRegions(emptyInventory, resolved.connections, resolved.regionRules);

    // Only menu is reachable — Vanilla Intro is gated behind 'Link Wakes Up'
    expect(reachable.has('menu')).toBe(true);
    expect(reachable.has('links-house')).toBe(false);
    expect(reachable.has('light-world-rain')).toBe(false);
  });

  it('should have only event checks at true game start (no events)', () => {
    const accessible = getAccessibleChecks(
      emptyInventory,
      noCompletedChecks,
      ALL_CHECKS,
      resolved.connections,
      resolved.regionRules,
      resolved.checkRules,
    );

    console.log(`Vanilla true start checks: ${accessible.length}`);
    console.log('Checks:', accessible.map(c => c.id).sort());

    // Only the 'Link Wakes Up' event check is in the menu region
    expect(accessible.length).toBe(1);
    expect(accessible[0].id).toBe('event-link-wakes-up');
  });

  it('should reach Links House + rain overworld + HC courtyard after Link Wakes Up (but NOT castle interior)', () => {
    const inventory = new Set([...emptyInventory, 'Link Wakes Up']);
    const reachable = getReachableRegions(inventory, resolved.connections, resolved.regionRules);

    // Vanilla intro: Menu → Link's House → Rain Overworld → Secret Entrance + Courtyard
    expect(reachable.has('menu')).toBe(true);
    expect(reachable.has('links-house')).toBe(true);
    expect(reachable.has('light-world-rain')).toBe(true);
    expect(reachable.has('hyrule-castle-courtyard')).toBe(true);
    expect(reachable.has('hyrule-castle-secret-entrance')).toBe(true);

    // Castle INTERIOR is NOT accessible until uncle check done
    expect(reachable.has('hyrule-castle')).toBe(false);

    // Full Light World is NOT accessible during rain
    expect(reachable.has('light-world')).toBe(false);

    // Sewers are blocked
    expect(reachable.has('sewer-drop')).toBe(false);
    expect(reachable.has('sewers-dark')).toBe(false);
  });

  it('should have only pre-uncle checks after Link Wakes Up', () => {
    const inventory = new Set([...emptyInventory, 'Link Wakes Up']);
    const accessible = getAccessibleChecks(
      inventory,
      noCompletedChecks,
      ALL_CHECKS,
      resolved.connections,
      resolved.regionRules,
      resolved.checkRules,
    );

    console.log(`Vanilla after wake-up checks: ${accessible.length}`);
    console.log('Checks:', accessible.map(c => c.id).sort());

    const ids = accessible.map(c => c.id);
    // Only Link's House, Uncle + event check (Secret Passage is past uncle)
    expect(ids).toContain("Link's House");
    expect(ids).toContain("Link's Uncle");
    expect(ids).toContain('event-link-wakes-up');

    // Secret Passage is beyond uncle, gated
    expect(ids).not.toContain('Secret Passage');

    // event-zelda-rescue is in hyrule-castle, gated behind uncle
    expect(ids).not.toContain('event-zelda-rescue');

    // Castle interior checks NOT accessible yet
    expect(ids).not.toContain('Hyrule Castle - Boomerang Chest');
    expect(ids).not.toContain('Hyrule Castle - Map Chest');
    expect(ids).not.toContain("Hyrule Castle - Zelda's Chest");

    // Sewer checks NOT accessible
    expect(ids).not.toContain('Sewers - Secret Room - Left');
    // Overworld checks NOT accessible (rain restricts)
    expect(ids).not.toContain('Mushroom');
    expect(ids).not.toContain('Flute Spot');
  });

  it('should open castle interior after Zelda Rescue Started (uncle done)', () => {
    const inventory = new Set([...emptyInventory, 'Link Wakes Up', 'Zelda Rescue Started']);
    const reachable = getReachableRegions(inventory, resolved.connections, resolved.regionRules);

    // Castle interior now accessible
    expect(reachable.has('hyrule-castle')).toBe(true);
    // Sewers accessible (Throne Room gated by same event)
    expect(reachable.has('sewer-drop')).toBe(true);
    expect(reachable.has('sewers-dark')).toBe(true);

    // Full Light World still blocked until Rescued Zelda
    expect(reachable.has('light-world')).toBe(false);
  });

  it('should NOT reach Death Mountain without progression', () => {
    const inventory = new Set([...emptyInventory, 'Link Wakes Up']);
    const reachable = getReachableRegions(inventory, resolved.connections, resolved.regionRules);

    expect(reachable.has('death-mountain')).toBe(false);
    expect(reachable.has('death-mountain-top')).toBe(false);
    expect(reachable.has('old-man-cave')).toBe(false);
  });

  it('should unlock full Light World after Rescued Zelda', () => {
    const inventory = new Set([...emptyInventory, 'Link Wakes Up', 'Rescued Zelda']);
    const reachable = getReachableRegions(inventory, resolved.connections, resolved.regionRules);

    // Full Light World now accessible (Links House Exit ungated)
    expect(reachable.has('light-world')).toBe(true);
    expect(reachable.has('links-house')).toBe(true);
    // Sanctuary reachable via light-world connection + S&Q
    expect(reachable.has('sanctuary')).toBe(true);
    // Still no Old Man S&Q
    expect(reachable.has('old-man-cave')).toBe(false);
  });

  it('should reach Old Man Cave after rescuing Old Man', () => {
    const inventory = new Set([...emptyInventory, 'Link Wakes Up', 'Rescued Zelda', 'Rescued Old Man']);
    const reachable = getReachableRegions(inventory, resolved.connections, resolved.regionRules);

    expect(reachable.has('old-man-cave')).toBe(true);
  });

  it('should reach Death Mountain with Power Glove after Rescued Zelda', () => {
    const inventory = new Set([...emptyInventory, 'Link Wakes Up', 'Rescued Zelda', 'Power Glove']);
    const reachable = getReachableRegions(inventory, resolved.connections, resolved.regionRules);

    expect(reachable.has('death-mountain')).toBe(true);
  });
});

describe('LogicConfig — Open Mode', () => {
  const resolved = resolveRules(OPEN_CONFIG);
  const emptyInventory = new Set<string>(resolved.startInventory);
  const noCompletedChecks = new Set<string>();

  it('should reach Sanctuary and Old Man Cave freely via S&Q', () => {
    const reachable = getReachableRegions(emptyInventory, resolved.connections, resolved.regionRules);

    expect(reachable.has('light-world')).toBe(true);
    expect(reachable.has('sanctuary')).toBe(true);
    expect(reachable.has('old-man-cave')).toBe(true);
  });

  it('should reach Death Mountain via Old Man S&Q chain', () => {
    const reachable = getReachableRegions(emptyInventory, resolved.connections, resolved.regionRules);

    expect(reachable.has('death-mountain')).toBe(true);
    expect(reachable.has('death-mountain-top')).toBe(true);
  });

  it('should have ~51 reachable checks with empty inventory (includes events)', () => {
    const accessible = getAccessibleChecks(
      emptyInventory,
      noCompletedChecks,
      ALL_CHECKS,
      resolved.connections,
      resolved.regionRules,
      resolved.checkRules,
    );

    console.log(`Open mode empty inventory checks: ${accessible.length}`);

    // Open mode: ~48 original checks + 3 progression event checks
    expect(accessible.length).toBeGreaterThanOrEqual(48);
    expect(accessible.length).toBeLessThanOrEqual(54);
  });

  it('should allow Castle Tower with Cape OR Sword in open mode', () => {
    // With Cape (no sword)
    const capeInventory = new Set([...emptyInventory, 'Cape']);
    const reachable = getReachableRegions(capeInventory, resolved.connections, resolved.regionRules);
    expect(reachable.has('agahnims-tower')).toBe(true);
  });
});

describe('LogicConfig — Custom Medallion Requirements', () => {
  it('should respect custom medallion for Misery Mire', () => {
    const config = { ...OPEN_CONFIG, medallionRequirements: { miseryMire: 'Bombos' as const, turtleRock: 'Quake' as const } };
    const resolved = resolveRules(config);

    // Ether should NOT work for Misery Mire
    const etherInventory = new Set(['Moon Pearl', 'Titans Mitts', 'Activated Flute', 'Fighter Sword', 'Ether']);
    const reachable1 = getReachableRegions(etherInventory, resolved.connections, resolved.regionRules);
    expect(reachable1.has('misery-mire-entrance')).toBe(false);

    // Bombos SHOULD work for Misery Mire
    const bombosInventory = new Set(['Moon Pearl', 'Titans Mitts', 'Activated Flute', 'Fighter Sword', 'Bombos']);
    const reachable2 = getReachableRegions(bombosInventory, resolved.connections, resolved.regionRules);
    expect(reachable2.has('misery-mire-entrance')).toBe(true);
  });

  it('should respect custom crystal count for GT', () => {
    const config = { ...OPEN_CONFIG, crystalsForGT: 4 };
    const resolved = resolveRules(config);

    // 4 crystals should be enough
    const inventory = new Set([
      'Moon Pearl', 'Power Glove',
      'Crystal 1', 'Crystal 2', 'Crystal 3', 'Crystal 4',
    ]);
    const reachable = getReachableRegions(inventory, resolved.connections, resolved.regionRules);
    expect(reachable.has('ganons-tower-entrance')).toBe(true);
  });
});

describe('LogicConfig — No Logic Mode', () => {
  it('should make everything reachable with no items', () => {
    const config = { ...OPEN_CONFIG, mode: 'no-logic' as const };
    const resolved = resolveRules(config);
    const emptyInventory = new Set<string>();

    const reachable = getReachableRegions(emptyInventory, resolved.connections, resolved.regionRules);

    // Every region should be reachable (no rules)
    expect(reachable.has('dark-death-mountain-top')).toBe(true);
    expect(reachable.has('ganons-tower-entrance')).toBe(true);
    expect(reachable.has('misery-mire-entrance')).toBe(true);
    expect(reachable.has('turtle-rock-entrance')).toBe(true);
  });
});
