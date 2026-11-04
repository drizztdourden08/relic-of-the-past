/* @layer tests @kind test */
// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
  const stub = (): unknown => new Proxy(() => Promise.resolve([]), { get: (_target, key) => (key === 'then' ? undefined : stub()) });
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
import { SlotRefField } from '@app/views/HudLayoutEditor/sub-components/SlotRefField';
import { PACKS, SLOTS } from './content-fixtures.constants';
import { installDomHarness } from './install-dom-harness';

const { mount, one } = installDomHarness();

describe('a slot number past the previewed scheme', { tags: ['standard'] }, () => {
  it('is accepted, drawn empty, and explained where it was typed', () => {
    mount(h(SlotRefField, {
      label: 'slot', value: 9, onChange: () => {}, slots: SLOTS, glyphPacks: PACKS,
    } as never));
    const trigger = one('.hud-ref-field');
    expect(trigger.textContent).toContain('Slot 9');
    expect(trigger.querySelector('img')).toBeNull();
    expect(document.body.textContent).toContain('reaches slot 4');
  });

  it('shows the bound glyph, and says nothing at all, for a number it has', () => {
    mount(h(SlotRefField, {
      label: 'slot', value: 1, onChange: () => {}, slots: SLOTS, glyphPacks: PACKS,
    } as never));
    expect(one('.hud-ref-field img').getAttribute('src')).toContain('south.svg');
    expect(document.body.textContent).not.toContain('Still legal');
  });
});
