// @vitest-environment jsdom
/* @layer tests @kind test */
/**
 * §50's two legend primitives. They exist because a legend that spells
 * `Ctrl+click · add` in prose is read as prose and therefore skipped; a cap and
 * a lit mouse are pictures, and a strip of four is scanned instead of parsed.
 *
 * WHAT IS WORTH ASSERTING ABOUT A PICTURE. Nothing here can see how it looks.
 * What it can check is that every variant is a DIFFERENT picture and that each
 * one is announced in words, which is the half a screen reader lives on. `KeyCap`
 * is a `<kbd>` for the same reason: the element already means "a key".
 */
import { afterEach, describe, expect, it } from 'vitest';
import { act, createElement as h, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { KeyCap } from '../../apps/web/src/ui/design-system/primitives/KeyCap';
import { MouseGlyph } from '../../apps/web/src/ui/design-system/primitives/MouseGlyph';
import type { MousePart } from '../../apps/web/src/ui/design-system/primitives/MouseGlyph';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

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
  act(() => mounted?.root.unmount());
  mounted.host.remove();
  mounted = null;
});

describe('KeyCap draws a cap, not text in brackets', () => {
  const LABELS = ['Ctrl', '⌘', '⇧', '←', 'Del', 'Esc', 'Enter'];

  it('prints every label the legends use, as a <kbd>', () => {
    mount(h('div', null, ...LABELS.map((label) => h(KeyCap, { key: label, label }))));
    const caps = Array.from(document.querySelectorAll('kbd.keycap'));
    expect(caps.map((c) => c.textContent)).toEqual(LABELS);
  });

  it('says the label aloud even when the label is a glyph nobody can pronounce', () => {
    mount(h(KeyCap, { label: '⇧', title: 'Shift' }));
    expect(document.querySelector('.keycap')?.getAttribute('title')).toBe('Shift');
  });

  it('falls back to the printed label when no spoken form is given', () => {
    mount(h(KeyCap, { label: 'Esc' }));
    expect(document.querySelector('.keycap')?.getAttribute('title')).toBe('Esc');
  });

  it('carries its size as a class, so two sizes are two rules and not two files', () => {
    mount(h('div', null, h(KeyCap, { label: 'A' }), h(KeyCap, { label: 'B', size: 'md' })));
    const classes = Array.from(document.querySelectorAll('.keycap')).map((c) => c.className);
    expect(classes[0]).toContain('keycap--sm');
    expect(classes[1]).toContain('keycap--md');
  });
});

describe('MouseGlyph lights the part it is about', () => {
  const PARTS: MousePart[] = ['left', 'right', 'wheel', 'drag'];

  it('renders all four as four different drawings', () => {
    mount(h('div', null, ...PARTS.map((part) => h(MouseGlyph, { key: part, part }))));
    const glyphs = Array.from(document.querySelectorAll('svg.mouse-glyph'));
    expect(glyphs.length).toBe(4);
    // One body each, and a lit part each. The outline never changes between
    // variants, which is what makes them read as states of one object.
    for (const glyph of glyphs) {
      expect(glyph.querySelectorAll('.mouse-glyph__body').length).toBe(1);
      expect(glyph.querySelectorAll('.mouse-glyph__lit').length).toBeGreaterThan(0);
    }
    const lit = glyphs.map((g) => Array.from(g.querySelectorAll('.mouse-glyph__lit'))
      .map((el) => `${el.tagName}:${el.getAttribute('d') ?? el.getAttribute('x')}`).join('|'));
    expect(new Set(lit).size).toBe(4);
  });

  it('names each part in words, because a picture is not a label', () => {
    mount(h('div', null, ...PARTS.map((part) => h(MouseGlyph, { key: part, part }))));
    expect(Array.from(document.querySelectorAll('svg.mouse-glyph')).map((g) => g.getAttribute('aria-label')))
      .toEqual(['left click', 'right click', 'scroll wheel', 'drag']);
  });

  it('takes a spoken form of its own when the caller has a better one', () => {
    mount(h(MouseGlyph, { part: 'drag', title: 'drag a rectangle' }));
    expect(document.querySelector('svg.mouse-glyph')?.getAttribute('aria-label')).toBe('drag a rectangle');
  });

  it('lights the same ear for a drag as for a click, because a drag is the button HELD', () => {
    mount(h('div', null, h(MouseGlyph, { part: 'left' }), h(MouseGlyph, { part: 'drag' })));
    const [left, drag] = Array.from(document.querySelectorAll('svg.mouse-glyph'));
    const ear = (el: Element): string | null => el.querySelector('path.mouse-glyph__lit')?.getAttribute('d') ?? null;
    expect(ear(drag)).toBe(ear(left));
    // Plus the travel, which is what makes it a drag and not a click.
    expect(drag.querySelectorAll('.mouse-glyph__lit').length).toBe(2);
  });
});
