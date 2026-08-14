/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { resolveRules } from '../../shared/game/logic/resolver';
import { getReachableScreens } from '../../shared/game/logic/eval';
import { VANILLA_CONFIG } from '../../shared/game/data/presets/vanilla';
import { ITEM_GROUP_IDS } from '../../shared/game/data/item-groups';
import { describeDataset } from '../dataset-guard';

describeDataset('resolveRules (id re-key regression)', () => {
  it('wires the menu spawn points to their new screen ids', () => {
    const { connections } = resolveRules(VANILLA_CONFIG);
    const fromMenu = connections.filter(c => c.from === 'menu').map(c => c.to);
    expect(fromMenu).toContain('screen-204'); // Link's House
    expect(fromMenu).toContain('screen-190'); // Old Man Cave
  });

  it('combines the vanilla intro gate with the S&Q rule under the re-keyed screen pair', () => {
    const { connections } = resolveRules(VANILLA_CONFIG);
    const edge = connections.find(c => c.from === 'menu' && c.to === 'screen-204');
    expect(edge?.requirements).toEqual({ anyOf: [{ checkId: 'check-001' }, { checkId: 'check-004' }] });
  });

  it('re-keys the pedestal check rule to its new CheckId and honors the config pendant count', () => {
    const { checkOverrides } = resolveRules({ ...VANILLA_CONFIG, pendantsForPedestal: 2 });
    expect(checkOverrides['check-072']).toEqual({ count: { groupId: ITEM_GROUP_IDS.Pendants, n: 2 } });
  });

  it('carries a real gated overworld edge through with its new screen ids', () => {
    const { connections } = resolveRules(VANILLA_CONFIG);
    const edge = connections.find(c => c.from === 'screen-031' && c.to === 'screen-212');
    expect(edge).toBeDefined();
    expect(edge?.requirements).toEqual({ itemId: 'item-041' }); // Bombs
  });

  it('getReachableScreens honors the re-keyed menu gate once its requirement is met', () => {
    const { connections } = resolveRules(VANILLA_CONFIG);
    const withoutGate = getReachableScreens(new Set(), new Set(), connections);
    expect(withoutGate.has('screen-204')).toBe(false);

    const withGate = getReachableScreens(new Set(), new Set(['check-001']), connections);
    expect(withGate.has('screen-204')).toBe(true);
  });

  it('leaves the open-mode save-quit spawn ungated (regression for the fixed open-mode bug)', () => {
    const openConfig = { ...VANILLA_CONFIG, mode: 'open' as const, saveQuitDestinations: ['screen-204' as const, 'screen-190' as const] };
    const { connections } = resolveRules(openConfig);
    const linksHouse = connections.find(c => c.from === 'menu' && c.to === 'screen-204');
    const oldManCave = connections.find(c => c.from === 'menu' && c.to === 'screen-190');
    expect(linksHouse?.requirements).toBeUndefined();
    expect(oldManCave?.requirements).toBeUndefined();

    const reachable = getReachableScreens(new Set(), new Set(), connections);
    expect(reachable.has('screen-204')).toBe(true);
    expect(reachable.has('screen-190')).toBe(true);
  });
});
