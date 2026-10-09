/* @layer tests @kind test */
// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
  const anything: unknown = new Proxy({}, { get: () => async () => [] });
  const global = globalThis as { window?: { api?: unknown }; ResizeObserver?: unknown };
  global.window ??= {};
  global.window.api ??= anything;
  global.ResizeObserver ??= class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  };
});

import { act, createElement as h } from 'react';
import { expand } from '../../../shared/hud/engine';
import { caseMatches, matchLabel, winnerIn } from '../../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/case-match';
import { textOfTextValue, textValueOf } from '../../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/value-text';
import { CaseListEditor } from '../../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/CaseListEditor';
import { TextContent } from '../../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/content/TextContent';
import type { HudNode, HudSwitchSpec } from '../../../shared/types/hud';
import { PACKS, SCOPE } from './content-fixtures.constants';
import { installDomHarness } from './install-dom-harness';

const { mount, one } = installDomHarness();

describe('the text mode switch is gone, and it was destroying expressions', () => {
  it('keeps the formula the document holds, and never stores the marker', () => {
    expect(textOfTextValue({ from: 'data', expr: 'bomb_current' })).toBe('= bomb_current');
    expect(textValueOf('= bomb_current')).toEqual({ from: 'data', expr: 'bomb_current' });
    expect(textValueOf('24')).toBe(24);
    expect(textValueOf('==24')).toBe('=24');
    expect(textOfTextValue('=24')).toBe('==24');
    expect(textValueOf('Bombs')).toBe('Bombs');
  });

  it('lets NOTHING else in the section overwrite a bound value (the bug)', () => {
    const patches: Record<string, unknown>[] = [];
    mount(h(TextContent, {
      spec: {
        type: 'text',
        value: { from: 'data', expr: 'bomb_current' },
        face: { from: 'sprite', set: 'hud-digits' },
      },
      onChange: (patch: Record<string, unknown>) => patches.push(patch),
      scope: SCOPE,
    } as never));

    const buttons = Array.from(document.querySelectorAll('button'));
    expect(buttons.length).toBeGreaterThan(0);
    act(() => { buttons.forEach((button) => button.click()); });
    expect(patches.filter((patch) => 'value' in patch)).toEqual([]);

    expect((one('[aria-label="Text"]') as HTMLInputElement).value).toBe('= bomb_current');
  });

  it('says what a digits-only face cannot draw', () => {
    mount(h(TextContent, {
      spec: { type: 'text', value: 7, face: { from: 'sprite', set: 'hud-digits' } },
      onChange: () => {}, scope: SCOPE,
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
