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

import { createElement as h } from 'react';
import { readFileSync } from 'fs';
import { SlotRefField } from '../../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/SlotRefField';
import { EDITOR, PACKS, SLOTS } from './content-fixtures.constants';
import { installDomHarness } from './install-dom-harness';

const { mount, one } = installDomHarness();

describe('a slot number past the previewed scheme', () => {
  it('is accepted, drawn empty, and explained where it was typed', () => {
    mount(h(SlotRefField, {
      label: 'slot', value: 9, onChange: () => {}, slots: SLOTS, glyphPacks: PACKS,
    } as never));
    const trigger = one('.hud-ref-field');
    expect(trigger.textContent).toContain('Slot 9');
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
    for (const file of ['content/SlotContent.tsx', 'content/GlyphContent.tsx', 'ButtonStatesEditor.tsx']) {
      const src = readFileSync(`${EDITOR}/sub-components/${file}`, 'utf8');
      const kept = [/hint="Any number/, /hint="Draws whichever/, /aria-label="Slot number"/]
        .filter((pattern) => pattern.test(src));
      expect(`${file}: ${kept.join(', ') || 'gone'}`).toBe(`${file}: gone`);
    }
  });
});
