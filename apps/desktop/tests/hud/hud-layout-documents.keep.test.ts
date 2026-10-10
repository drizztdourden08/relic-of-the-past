/* @layer test @kind test */
import { describe, expect, it } from 'vitest';
import defaultJson from '../../../../packages/hud/data/layouts/default.json';
import { BUILT_IN_LAYOUTS, layoutById, loadLayout, tryLoadLayout, layoutHud } from '@rotp/hud';
import type { HudLayout } from '@rotp/hud';

const VIEW = { w: 398, h: 224 };

const edited = (change: (doc: Record<string, unknown>) => void): unknown => {
  const copy = JSON.parse(JSON.stringify(defaultJson)) as Record<string, unknown>;
  change(copy);
  return copy;
};

const bandOf = (doc: Record<string, unknown>, index: number): Record<string, unknown> =>
  ((doc.screen as { children: Record<string, unknown>[] }).children)[index];

const errorsOf = (value: unknown): string[] => {
  const result = tryLoadLayout(value);
  expect(result.ok, 'this document should have been refused').toBe(false);
  return result.ok ? [] : result.errors;
};

describe('one reader for built-in and custom alike', () => {
  it('every shipped document loads, and the three are the three', () => {
    expect(BUILT_IN_LAYOUTS.map((doc) => doc.id))
      .toEqual(['default', 'compact', 'bottom-right']);
    BUILT_IN_LAYOUTS.forEach((doc) => {
      expect(doc.screen.children.length, `${doc.id} has bands`).toBeGreaterThan(0);
      expect(doc.builtIn).toBe(true);
    });
  });

  it('the same document saved as a player\'s own draws identically', () => {
    const custom = loadLayout(edited((doc) => {
      doc.id = 'custom-1';
      doc.name = 'Mine';
      doc.builtIn = false;
      doc.basedOn = 'default';
    }), 'a custom layout');
    const builtIn = layoutById('default') as HudLayout;
    expect(custom.builtIn).toBe(false);
    expect(custom.basedOn).toBe('default');
    expect(layoutHud(custom, VIEW, { hearts: 20 }).map((node) => node.rect))
      .toEqual(layoutHud(builtIn, VIEW, { hearts: 20 }).map((node) => node.rect));
  });

  it('what comes back is rebuilt, not the input object', () => {
    const raw = edited(() => undefined) as { screen: { children: unknown[] } };
    const doc = loadLayout(raw);
    expect(doc.screen).not.toBe(raw.screen);
    expect(doc.screen.children[0]).not.toBe(raw.screen.children[0]);
    expect(JSON.stringify(doc)).not.toContain('$comment');
  });
});

describe('a bad document fails loudly, at the line that is wrong', () => {
  it('names the path of a mis-typed key instead of dropping it', () => {
    const errors = errorsOf(edited((doc) => {
      bandOf(doc, 0).gapp = 4;
    }));
    expect(errors).toContain("layout.screen.children[0]: unknown key 'gapp'");
  });

  it('refuses a length that is not a length, and says what one looks like', () => {
    const errors = errorsOf(edited((doc) => {
      bandOf(doc, 0).size = { w: 40 };
    }));
    expect(errors[0]).toMatch(/screen\.children\[0\]\.size\.w: expected 'auto', 'fill', \{ px \} or \{ pct \}/);
  });

  it('refuses a glyph that names both a position and a slot', () => {
    const errors = errorsOf(edited((doc) => {
      const buttons = bandOf(doc, 2) as unknown as { children: { children: { children: { element: unknown }[] }[] }[] };
      buttons.children[0].children[0].children[0].element = { type: 'glyph', position: 'NORTH', slot: 1 };
    }));
    expect(errors.some((e) => e.includes('either a position or a slot'))).toBe(true);
  });

  it('refuses an unknown element type, a bad self-alignment and a repeated id', () => {
    expect(errorsOf(edited((doc) => {
      const wallet = bandOf(doc, 1) as unknown as { children: { children: { element: unknown }[] }[] };
      wallet.children[0].children[0].element = { type: 'hearts' };
    })).some((e) => e.includes('unknown element type'))).toBe(true);

    expect(errorsOf(edited((doc) => {
      bandOf(doc, 0).justifySelf = 'middle';
    })).some((e) => e.includes('justifySelf'))).toBe(true);

    expect(errorsOf(edited((doc) => {
      (bandOf(doc, 0) as unknown as { children: { id: string }[] }).children[1].id = 'hearts';
    })).some((e) => e.includes("'hearts' is used more than once"))).toBe(true);
  });

  it('refuses a screen that is a bare element - the root holds the whole layout', () => {
    const errors = errorsOf(edited((doc) => {
      doc.screen = { kind: 'element', id: 'x', element: { type: 'slot', index: 1 } };
    }));
    expect(errors.some((e) => e.includes('the screen is a container'))).toBe(true);
  });

  it('throws with the source and every reason, so a broken build says which file', () => {
    expect(() => loadLayout({ id: 'x' }, 'built-in/broken.json'))
      .toThrow(/built-in\/broken\.json is not a valid HUD layout:[\s\S]*layout\.name/);
  });

  it('refuses nonsense outright instead of drawing part of it', () => {
    expect(errorsOf(null)).toEqual(['expected a layout document object']);
    expect(errorsOf({ id: 'a', name: 'a', builtIn: true })
      .some((e) => e.includes('draws nothing'))).toBe(true);
  });
});
