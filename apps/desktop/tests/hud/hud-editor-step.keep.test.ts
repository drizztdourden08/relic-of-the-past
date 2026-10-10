/* @layer tests @kind test */
// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { act, createElement as h, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { filesIn } from './files-in';
import { EditorStepContext } from '@app/hud-layout-editing/editor-step';
import { ValueField } from '@app/views/HudLayoutEditor/sub-components/ValueField';
import type { Value } from '@rotp/hud';
import { REPO_ROOT } from '../repo-root';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const ED = resolve(REPO_ROOT, 'apps/desktop/src/views/HudLayoutEditor');
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

describe('the editor\'s step is a default, and only a default', () => {
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

describe('every ValueField call site is either in pixels or names its step', () => {
  const files = (dir: string): string[] => filesIn(dir, (name) => name.endsWith('.tsx'));

  const NOT_PIXELS = ['count', 'angle', 'duration (ms)', 'delay (ms)', 'opacity', 'amount'];

  it('passes an explicit step wherever the number is not a pixel', () => {
    const offenders: string[] = [];
    for (const file of files(`${ED}/sub-components`)) {
      const src = readFileSync(file, 'utf8');
      for (const call of src.match(/<ValueField[\s\S]*?\/>/g) ?? []) {
        const label = /label=(?:"([^"]*)"|\{`([^`]*)`\})/.exec(call);
        const name = label?.[1] ?? label?.[2] ?? '';
        const needs = NOT_PIXELS.some((n) => name.includes(n));
        if (needs && !call.includes('step=')) offenders.push(`${file.split(/[\\/]/).pop()}:${name}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('has no StepNumberInput left to reach for', () => {
    const all = files(ED).map((f) => readFileSync(f, 'utf8')).join('\n');
    expect(all).not.toContain("from './StepNumberInput'");
    expect(all).not.toContain('<StepNumberInput');
    expect(readFileSync(resolve(REPO_ROOT, 'apps/desktop/src/theme/hud-layout-editor/layout.css'), 'utf8'))
      .not.toContain('hud-value-input__spin');
  });
});
