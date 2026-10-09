/* @layer tests @kind test */
// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
  const stub = (): unknown => new Proxy(async () => [], { get: (_target, key) => (key === 'then' ? undefined : stub()) });
  const anything = stub();
  const global = globalThis as { window?: { api?: unknown }; ResizeObserver?: unknown };
  global.window ??= {};
  global.window.api ??= anything;
  global.ResizeObserver ??= class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  };
});

import { createElement as h } from 'react';
import { nodeArtOf } from '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/behavior/node-art';
import { ButtonStateRow } from '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/ButtonStateRow';
import { GlyphContent } from '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/content/GlyphContent';
import { RepeatContent } from '../../../apps/desktop/src/ui/domains/app/views/HudLayoutEditor/sub-components/content/RepeatContent';
import type { HudNode } from '../../../shared/types/hud';
import { PACKS, SCOPE } from './content-fixtures.constants';
import { installDomHarness } from './install-dom-harness';
import { roundTrips } from './round-trips';

const { mount, one, click } = installDomHarness();

describe('a reference shows the referent, and picking one round-trips', () => {
  it('draws a glyph as its artwork and writes back what the grid picked', () => {
    const patches: Record<string, unknown>[] = [];
    mount(h(GlyphContent, {
      spec: { type: 'glyph', position: 'SOUTH' },
      onChange: (patch: Record<string, unknown>) => patches.push(patch),
      glyphPacks: PACKS,
    } as never));

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
    expect(document.querySelectorAll('input[type="text"], input:not([type])')).toHaveLength(0);

    click('.hud-ref-field');
    click('[title="EAST"]');
    expect(faces).toEqual([{ from: 'glyph', pack: 'generic', glyph: 'EAST' }]);
  });

  it('names a switch case and a repeat child by what they are, and jumps to them', () => {
    const sprite = { kind: 'element', id: 'sprite-3f21', element: { type: 'sprite', file: 'hud-heart-full' } } as HudNode;
    const art = nodeArtOf(sprite, PACKS);
    expect(art.kind).toBe('sprite');
    expect(art.name).not.toBe('hud-heart-full');
    expect(art.src).toContain('hud-heart-full.png');

    const jumped: string[] = [];
    mount(h(RepeatContent, {
      spec: { type: 'repeat', count: 4, child: sprite },
      onChange: () => {}, scope: SCOPE, glyphPacks: PACKS,
      onSelectNode: (id: string) => jumped.push(id),
    } as never));
    expect(one('.hud-ref-field .hud-ref-field__caret').textContent).toBe('↗');
    click('.hud-ref-field');
    expect(jumped).toEqual(['sprite-3f21']);
  });
});
