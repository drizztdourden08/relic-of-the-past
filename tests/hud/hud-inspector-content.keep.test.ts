// @vitest-environment jsdom
/* @layer tests @kind test */
/**
 * The BEHAVIOUR half of phase 9 of `plans/hud-inspector-ux-review.html`.
 * Widths are measured next door in `hud-inspector-content-width`.
 *
 * FOUR CLAIMS, and one of them is a bug that shipped:
 *
 *  1. A REFERENCE SHOWS THE REFERENT, for all five kinds, and picking one
 *     round-trips through the document unchanged. Asserted by mounting the
 *     real editor, clicking the real control, opening the real picker and
 *     reading back the patch it wrote, instead of inspecting markup.
 *  2. THE TEXT MODE SWITCH DISCARDED THE EXPRESSION. `TextContent` used to
 *     carry an outer `text | ƒx` `SegmentedControl` whose `text` branch wrote
 *     `''` over `{ from: 'data', expr }`. The test that would have caught it
 *     is here, written as the property it violates: with a formula in the
 *     field, NOTHING else in the section may write `value`. It fails on the
 *     old file (the switch is a control, and clicking it emits `value: ''`)
 *     and passes on this one, because there is no switch to click.
 *  3. THE LIVE-MATCH MARKER IS THE ENGINE'S OWN ANSWER, pinned against
 *     `expand()` for the same document and the same scope instead of against
 *     a second reading of the same rule.
 *  4. A SLOT NUMBER PAST THE PREVIEWED SCHEME IS STILL LEGAL. It draws empty,
 *     it says why in one line, and it is still the number it was given.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

// The glyph artwork resolver reaches `custom-glyph-store`, which reaches the
// desktop bridge at MODULE scope (`window.api.listControllers`), which is three files
// away from anything this suite is about. Stubbed before the imports below run,
// because a reference field asking for a URL must not need a controller.
vi.hoisted(() => {
  const anything: unknown = new Proxy({}, { get: () => async () => [] });
  const global = globalThis as { window?: { api?: unknown }; ResizeObserver?: unknown };
  global.window ??= {};
  global.window.api ??= anything;
  // `SegmentedControl` measures its own indicator on mount; jsdom has no
  // layout, so the observer never has anything to report and a no-op is the
  // honest stub, not a fake measurement.
  global.ResizeObserver ??= class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  };
});

import { act, createElement as h, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { expand } from '../../shared/hud/engine';
import { validateLayout } from '../../shared/hud/layouts';
import { caseMatches, matchLabel, winnerIn } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/case-match';
import { textOfTextValue, textValueOf } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/value-text';
import { nodeArtOf } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/node-art';
import { CaseListEditor } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/CaseListEditor';
import { ButtonStateRow } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/ButtonStateRow';
import { SlotRefField } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/SlotRefField';
import { GlyphContent } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/content/GlyphContent';
import { RepeatContent } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/content/RepeatContent';
import { TextContent } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/content/TextContent';
import type { GlyphPack, HudLayout, HudNode, HudSwitchSpec } from '../../shared/types/hud';
import type { ModernSlot } from '../../shared/types/controls';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const EDITOR = resolve(__dirname, '../../apps/web/src/ui/domains/app/views/HudLayoutEditor');

let mounted: { root: Root; host: HTMLElement } | null = null;

const mount = (node: ReactNode): void => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => { root.render(node); });
  mounted = { root, host };
};

afterEach(() => {
  if (!mounted) return;
  const { root, host } = mounted;
  act(() => root.unmount());
  host.remove();
  mounted = null;
});

const one = (selector: string): HTMLElement => {
  const el = document.querySelector(selector);
  if (!el) throw new Error(`nothing matched ${selector}`);
  return el as HTMLElement;
};

const click = (selector: string): void => { act(() => { one(selector).click(); }); };

const PACKS: readonly GlyphPack[] = [{
  id: 'generic',
  name: 'Generic',
  builtIn: true,
  glyphs: {
    SOUTH: { kind: 'built-in', assetPath: 'buttons/generic/south.svg' },
    EAST: { kind: 'built-in', assetPath: 'buttons/generic/east.svg' },
  },
}];

const SLOTS: readonly ModernSlot[] = [1, 2, 3, 4].map((index) => ({
  index, binding: { type: 'none' }, label: `Slot ${index}`, position: index === 1 ? 'SOUTH' : 'EAST',
} as ModernSlot));

const scope = { life_current: 112, life_max: 160, item: 4, index: 0, count: 20 };

/** A document whose only region root holds `node`. That is enough for `validateLayout`
 *  to accept or refuse what a picker just wrote. */
const documentWith = (node: HudNode): HudLayout => ({
  id: 'doc', name: 'doc', builtIn: false,
  screen: {
    kind: 'container',
    id: 'screen',
    layout: 'grid',
    columns: ['auto'],
    children: [{ kind: 'container', id: 'root', direction: 'row', children: [node] }],
  },
} as unknown as HudLayout);

/** The document accepts what the picker wrote, and re-reading the saved file
 *  gives back exactly the same tree. That is the whole of "it round-trips". */
const roundTrips = (node: HudNode): string => {
  const doc = documentWith(node);
  const reloaded = JSON.parse(JSON.stringify(doc)) as HudLayout;
  const errors = validateLayout(doc).errors;
  if (errors.length > 0) return errors.join('; ');
  return JSON.stringify(reloaded) === JSON.stringify(doc) ? 'round-trips' : 'changed on reload';
};

describe('a reference shows the referent, and picking one round-trips', () => {
  it('draws a glyph as its artwork and writes back what the grid picked', () => {
    const patches: Record<string, unknown>[] = [];
    mount(h(GlyphContent, {
      spec: { type: 'glyph', position: 'SOUTH' },
      onChange: (patch: Record<string, unknown>) => patches.push(patch),
      glyphPacks: PACKS,
    } as never));

    // The control IS the artwork: an <img>, not the token `SOUTH` in a box.
    const trigger = one('.hud-ref-field');
    expect(trigger.querySelector('img')?.getAttribute('src')).toContain('south.svg');
    expect(trigger.textContent).toContain('SOUTH');

    click('.hud-ref-field');
    click('[title="EAST"]');
    expect(patches).toEqual([{ position: 'EAST' }]);
    expect(roundTrips({ kind: 'element', id: 'g', element: { type: 'glyph', position: 'EAST' } } as HudNode)).toBe('round-trips');
  });

  it('draws a button face as its artwork and writes back what the grid picked', () => {
    const faces: unknown[] = [];
    mount(h(ButtonStateRow, {
      state: 'idle', required: true,
      face: { from: 'glyph', pack: 'generic', glyph: 'SOUTH' },
      glyphPacks: PACKS,
      onChange: (next: unknown) => faces.push(next),
    } as never));

    expect(one('.hud-ref-field').querySelector('img')?.getAttribute('src')).toContain('south.svg');
    // The image branch's free-text sprite slug is gone from the whole row.
    expect(document.querySelectorAll('input[type="text"], input:not([type])')).toHaveLength(0);

    click('.hud-ref-field');
    click('[title="EAST"]');
    expect(faces).toEqual([{ from: 'glyph', pack: 'generic', glyph: 'EAST' }]);
  });

  it('names a switch case and a repeat child by what they are, and jumps to them', () => {
    // `nodeArtOf` is the shared answer both call sites render.
    const sprite = { kind: 'element', id: 'sprite-3f21', element: { type: 'sprite', file: 'hud-heart-full' } } as HudNode;
    const art = nodeArtOf(sprite, PACKS);
    expect(art.kind).toBe('sprite');
    expect(art.name).not.toBe('hud-heart-full');
    expect(art.src).toContain('hud-heart-full.png');

    const jumped: string[] = [];
    mount(h(RepeatContent, {
      spec: { type: 'repeat', count: 4, child: sprite },
      onChange: () => {}, scope, glyphPacks: PACKS,
      onSelectNode: (id: string) => jumped.push(id),
    } as never));
    // `go`, not `pick`: a subtree is edited in place, so the caret says so.
    expect(one('.hud-ref-field .hud-ref-field__caret').textContent).toBe('↗');
    click('.hud-ref-field');
    expect(jumped).toEqual(['sprite-3f21']);
  });
});

describe('the text mode switch is gone, and it was destroying expressions', () => {
  it('keeps the formula the document holds, and never stores the marker', () => {
    expect(textOfTextValue({ from: 'data', expr: 'bomb_current' })).toBe('= bomb_current');
    expect(textValueOf('= bomb_current')).toEqual({ from: 'data', expr: 'bomb_current' });
    // `24` is a NUMBER, so `format.digits`/`pad` stay meaningful; `==24` is the
    // literal string `=24`; everything else is itself.
    expect(textValueOf('24')).toBe(24);
    expect(textValueOf('==24')).toBe('=24');
    expect(textOfTextValue('=24')).toBe('==24');
    expect(textValueOf('Bombs')).toBe('Bombs');
  });

  it('lets NOTHING else in the section overwrite a bound value (the bug)', () => {
    // THE REGRESSION, AS THE PROPERTY IT BROKE. The old outer switch was one of
    // the controls this loop clicks, and its `text` branch emitted
    // `{ value: '' }`, so this assertion fails on the previous file and passes
    // on this one. Nothing here knows the switch ever existed, which is why it
    // keeps working when the next control is added.
    const patches: Record<string, unknown>[] = [];
    mount(h(TextContent, {
      spec: {
        type: 'text',
        value: { from: 'data', expr: 'bomb_current' },
        face: { from: 'sprite', set: 'hud-digits' },
      },
      onChange: (patch: Record<string, unknown>) => patches.push(patch),
      scope,
    } as never));

    const buttons = Array.from(document.querySelectorAll('button'));
    expect(buttons.length).toBeGreaterThan(0);
    act(() => { buttons.forEach((button) => button.click()); });
    expect(patches.filter((patch) => 'value' in patch)).toEqual([]);

    // And the field still reads the expression back, marker and all.
    expect((one('[aria-label="Text"]') as HTMLInputElement).value).toBe('= bomb_current');
  });

  it('says what a digits-only face cannot draw', () => {
    mount(h(TextContent, {
      spec: { type: 'text', value: 7, face: { from: 'sprite', set: 'hud-digits' } },
      onChange: () => {}, scope,
    } as never));
    expect(document.body.textContent).toContain('digits only');
  });
});

describe('the live-match marker is the engine own answer', () => {
  const cases: HudSwitchSpec['cases'] = [
    { when: 'item >= 8', node: { kind: 'element', id: 'full', element: { type: 'shape', shape: 'heart', fill: 1 } } },
    { when: 'item >= 4', node: { kind: 'element', id: 'half', element: { type: 'shape', shape: 'heart', fill: 0.5 } } },
  ] as HudSwitchSpec['cases'];
  const otherwise = { kind: 'element', id: 'empty', element: { type: 'shape', shape: 'heart', fill: 0 } } as HudNode;

  it('picks the same branch expansion does, case by case', () => {
    for (const item of [0, 3, 4, 7, 8, 20]) {
      const spec: HudSwitchSpec = { type: 'switch', cases, otherwise } as HudSwitchSpec;
      const node = { kind: 'element', id: 'sw', element: spec } as HudNode;
      const drawn = expand(node, { scope: { item } });
      const marked = winnerIn(cases, { item });
      const expected = marked === -1 ? otherwise.id : cases[marked].node.id;
      expect(`item ${item} → ${drawn.id}`).toBe(`item ${item} → ${expected}`);
    }
  });

  it('marks the matching case and nothing else, for one previewed scope', () => {
    mount(h(CaseListEditor, {
      spec: { type: 'switch', cases, otherwise },
      onChange: () => {}, scope: { item: 4 }, glyphPacks: PACKS,
      selectedId: null, onSelectNode: () => {},
    } as never));
    const live = Array.from(document.querySelectorAll('.hud-case-list__live')).map((el) => el.textContent);
    expect(live).toEqual(['matches now']);
    const rows = Array.from(document.querySelectorAll('.hud-case-list__row'));
    expect(rows.map((row) => row.className.includes('is-live'))).toEqual([false, true, false]);
  });

  it('counts instances instead of picking one, and never marks a dead branch', () => {
    const instances = Array.from({ length: 20 }, (_unused, index) => ({ item: index }));
    const counted = caseMatches(cases, instances);
    expect(counted.wins).toEqual([12, 4]);
    expect(counted.otherwise).toBe(4);
    expect(matchLabel(counted.wins[1], counted.total)).toBe('matches 4 of 20');
    expect(matchLabel(0, 20)).toBeNull();
  });
});

describe('a slot number past the previewed scheme', () => {
  it('is accepted, drawn empty, and explained where it was typed', () => {
    mount(h(SlotRefField, {
      label: 'slot', value: 9, onChange: () => {}, slots: SLOTS, glyphPacks: PACKS,
    } as never));
    const trigger = one('.hud-ref-field');
    expect(trigger.textContent).toContain('Slot 9');
    // Empty, not broken: `Thumbnail`'s placeholder instead of an <img>.
    expect(trigger.querySelector('img')).toBeNull();
    expect(document.body.textContent).toContain('reaches slot 4');
    expect(document.body.textContent).toContain('Still legal');
  });

  it('shows the bound glyph, and says nothing at all, for a number it has', () => {
    mount(h(SlotRefField, {
      label: 'slot', value: 1, onChange: () => {}, slots: SLOTS, glyphPacks: PACKS,
    } as never));
    expect(one('.hud-ref-field img').getAttribute('src')).toContain('south.svg');
    expect(document.body.textContent).not.toContain('Still legal');
  });

  it('has retired all three copies of the standing disclaimer', () => {
    // The sentence was true of every slot number in the project and printed as
    // a HINT at three fields, none of which it told anything about the number
    // actually typed. The MODEL still says it, because the file headers are where a
    // standing rule belongs. But no field recites it any more, and no field
    // asks for a slot with a bare spinner either.
    for (const file of ['content/SlotContent.tsx', 'content/GlyphContent.tsx', 'ButtonStatesEditor.tsx']) {
      const src = readFileSync(`${EDITOR}/sub-components/${file}`, 'utf8');
      const kept = [/hint="Any number/, /hint="Draws whichever/, /aria-label="Slot number"/]
        .filter((pattern) => pattern.test(src));
      expect(`${file}: ${kept.join(', ') || 'gone'}`).toBe(`${file}: gone`);
    }
  });
});
