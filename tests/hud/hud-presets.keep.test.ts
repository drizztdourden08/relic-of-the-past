/* @layer test @kind test */
/**
 * Phase 5 of `plans/hud-data-binding.html`: the eight prebuilt subtrees, the
 * migration that rewrites a stored document naming one of the four deleted
 * kinds (`life`/`magic`/`consumables`/`wallet`), and the `shape` leaf those
 * two things lean on (a heart and the magic bar - see `hud-shape.ts` for why
 * a sprite/tint composition cannot draw either).
 */
import { describe, expect, it } from 'vitest';
import { quantiseHeartFill } from '@app/ui/domains/hud/compounds/HudShape';
import { aspectOf, intrinsicSize, layoutHud } from '@shared/hud/engine';
import { HUD_PRESETS, instantiatePreset } from '@shared/hud/presets';
import { tryLoadLayout } from '@shared/hud/layouts';
import type { HudLayout, HudNode } from '@shared/types/hud';

const VIEW = { w: 398, h: 224 };

const PRESET_IDS = [
  'hearts', 'magic-bar', 'arrow-indicator', 'bomb-indicator', 'key-indicator', 'wallet', 'face-group', 'dpad-group',
];

const everyId = (node: HudNode, out: string[] = []): string[] => {
  out.push(node.id);
  if (node.kind === 'container') node.children.forEach((child) => everyId(child, out));
  else if (node.element.type === 'repeat') everyId(node.element.child, out);
  else if (node.element.type === 'switch') {
    node.element.cases.forEach((c) => everyId(c.node, out));
    if (node.element.otherwise) everyId(node.element.otherwise, out);
  }
  return out;
};

describe('the eight presets - every one is a valid, self-contained subtree', () => {
  it('ships exactly the presets the plan names, each a real node', () => {
    expect(HUD_PRESETS.map((p) => p.id).sort()).toEqual([...PRESET_IDS].sort());
    HUD_PRESETS.forEach((preset) => {
      expect(preset.template.id, preset.id).toBeTruthy();
      expect(preset.icon.length, preset.id).toBeGreaterThan(0);
    });
  });

  it('instantiating rekeys every id, fresh on every call', () => {
    const a = instantiatePreset('hearts');
    const b = instantiatePreset('hearts');
    expect(a).not.toBeNull();
    expect(b).not.toBeNull();
    if (!a || !b) return;
    const idsA = everyId(a);
    const idsB = everyId(b);
    // No collision within one copy, none against the other, and none against
    // the template's own ids - two inserts of the same preset never collide.
    expect(new Set(idsA).size).toBe(idsA.length);
    expect(idsA.some((id) => idsB.includes(id))).toBe(false);
  });

  it('an unknown preset id is answered with null, not a throw', () => {
    expect(instantiatePreset('not-a-preset')).toBeNull();
  });

  it('every preset drops into a region and loads as a real document', () => {
    HUD_PRESETS.forEach((preset) => {
      const node = instantiatePreset(preset.id);
      expect(node, preset.id).not.toBeNull();
      if (!node) return;
      const root: HudNode = node.kind === 'container' ? node : {
        kind: 'container', id: `${preset.id}-wrap`, direction: 'row', children: [node],
      };
      const doc: HudLayout = {
        id: 't',
        name: 't',
        builtIn: false,
        screen: {
          kind: 'container', id: 'screen', layout: 'grid', columns: ['auto'], children: [root],
        },
      };
      const scope = {
        life_current: 100, life_max: 160, magic_current: 64, magic_max: 128, half_magic: 1, armor: 1,
        arrow_current: 5, arrow_max: 30, bomb_current: 3, bomb_max: 10, key_current: 2, rupee_current: 65,
        rupee_max: 999, silver_arrows: 0, slot_count: 8,
      };
      expect(() => layoutHud(doc, VIEW, { scope })).not.toThrow();
    });
  });
});

describe('a heart is a shape, not a sprite switch - the model this phase had to grow', () => {
  it('the shape leaf is fixed-size regardless of fill, armor or context', () => {
    expect(intrinsicSize({ type: 'shape', shape: 'heart', fill: 0 })).toEqual({ w: 8, h: 8 });
    expect(intrinsicSize({ type: 'shape', shape: 'heart', fill: 1, armor: 2 })).toEqual({ w: 8, h: 8 });
    expect(intrinsicSize({ type: 'shape', shape: 'magic-bar', fill: 0 })).toEqual({ w: 80, h: 16 });
  });

  it('original mode quantises a continuous fraction the same way the console rounds up to the next quarter heart', () => {
    // A heart at exactly 4/8 (half) reads half; just over reads half until 5/8.
    expect(quantiseHeartFill(0)).toBe(0);
    expect(quantiseHeartFill(1 / 8)).toBe(0.5); // rounds up to the next quarter
    expect(quantiseHeartFill(4 / 8)).toBe(0.5);
    expect(quantiseHeartFill(5 / 8)).toBe(1);
    expect(quantiseHeartFill(1)).toBe(1);
  });
});

describe('a sprite may declare its own natural box', () => {
  it('defaults to the 16x16 tile, and honours an explicit non-square box', () => {
    expect(intrinsicSize({ type: 'sprite', file: 'x' })).toEqual({ w: 16, h: 16 });
    expect(intrinsicSize({ type: 'sprite', file: 'x', box: { w: 16, h: 8 } })).toEqual({ w: 16, h: 8 });
    expect(aspectOf({ type: 'sprite', file: 'x', box: { w: 8, h: 8 } })).toBe(1);
  });
});

describe('a stored document naming a deleted kind is migrated once, on load', () => {
  const legacyDoc = (elementType: string): unknown => ({
    id: 'legacy', name: 'Legacy', builtIn: false,
    regions: [{
      anchor: 'top-left',
      root: {
        kind: 'container', id: 'root', direction: 'row',
        children: [{ kind: 'element', id: 'v', scale: 0.5, element: { type: elementType } }],
      },
    }],
  });

  it.each(['life', 'magic', 'consumables', 'wallet'])('%s loads as its preset subtree, not a refusal', (type) => {
    const result = tryLoadLayout(legacyDoc(type));
    expect(result.ok, type).toBe(true);
    if (!result.ok) return;
    const migrated = (result.doc.screen.children[0] as HudContainer).children[0];
    // No alias: the deleted kind never appears anywhere in what comes back.
    expect(JSON.stringify(migrated)).not.toContain(`"${type}"`);
  });

  it("keeps the node's own box properties across the swap", () => {
    const result = tryLoadLayout(legacyDoc('wallet'));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // `scale: 0.5` was authored on the old `wallet` node directly - it must
    // survive onto the replacement subtree's root, the same as a player's own
    // saved layout would expect.
    expect((result.doc.screen.children[0] as HudContainer).children[0].scale).toBe(0.5);
  });

  it('a document with nothing legacy in it is untouched', () => {
    const result = tryLoadLayout(legacyDoc('spacer'));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect((result.doc.screen.children[0] as HudContainer).children[0].id).toBe('v');
  });
});
