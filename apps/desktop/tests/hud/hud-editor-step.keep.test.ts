/* @layer tests @kind test */
// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { act, createElement as h, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { EditorStepContext } from '@app/hud-layout-editing/editor-step';
import { ValueField } from '@app/views/HudLayoutEditor/sub-components/ValueField';
import type { Value } from '@rotp/hud';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let mounted: { root: Root; host: HTMLElement } | null = null;
let written: Value | undefined;

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

const nudge = (field: ReactNode): Value | undefined => {
  mount(field);
  const up = document.querySelector<HTMLElement>('[aria-label^="Increment"]');
  if (!up) throw new Error('no spinner');
  act(() => { up.click(); });
  return written;
};

const field = (props: Record<string, unknown>): ReactNode => h(ValueField, {
  label: 'n', value: 10, scope: {}, onChange: (next: Value) => { written = next; }, ...props,
});

describe('the editor\'s step is a default, and only a default', { tags: ['standard'] }, () => {
  it('reaches a field that asks for nothing', () => {
    expect(nudge(h(EditorStepContext.Provider, { value: 8 }, field({})))).toBe(18);
  });

  it('loses to a field that names its own', () => {
    expect(nudge(h(EditorStepContext.Provider, { value: 8 }, field({ step: 0.05, value: 0.5 }))))
      .toBeCloseTo(0.55, 5);
  });

  it('is 1 with no provider above it, exactly as before the context existed', () => {
    expect(nudge(field({}))).toBe(11);
  });
});
