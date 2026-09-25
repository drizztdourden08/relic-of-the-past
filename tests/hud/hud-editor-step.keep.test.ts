// @vitest-environment jsdom
/* @layer tests @kind test */
/**
 * THE EDITOR'S STEP, AND THE SECOND NUMERIC INPUT IT NO LONGER NEEDS (§56).
 *
 * > "what the hell. we already have a numbered input.... we don't need a new
 * > one."
 *
 * §55 built `StepNumberInput`, which was `− [ValueInput] +` with the spinner
 * hidden in CSS, so that a gap could move by the editor's own step. That was a whole
 * component to carry one prop, and `ValueInput` has taken a `step` since §36.
 * This file pins the replacement, which is four claims:
 *
 * 1. THE CONTEXT REACHES `ValueField`. A field with no step of its own moves by
 *    whatever the View last put in `EditorStepContext`.
 * 2. AN EXPLICIT `step` BEATS IT. 0.05 is a fact about `opacity`; 8 is a fact
 *    about the session, and the field's own answer has to win or the one panel
 *    setting silently breaks every fraction in the inspector.
 * 3. THE DEFAULT OUTSIDE A PROVIDER IS 1, which is what every `ValueInput` did before
 *    the context existed, so a fixture or a measurement rig is unaffected.
 * 4. NOTHING IN PIXELS IS LEFT OUT, and nothing that is NOT in pixels is swept
 *    in. Every `ValueField` call site is read off disk and checked against the
 *    two lists, because this is exactly the kind of rule that is true the day
 *    it is written and false two features later.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { act, createElement as h, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { EditorStepContext } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/behavior/editor-step';
import { ValueField } from '../../apps/web/src/ui/domains/app/views/HudLayoutEditor/sub-components/ValueField';
import type { Value } from '../../shared/types/hud';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const ED = resolve(__dirname, '../../apps/web/src/ui/domains/app/views/HudLayoutEditor');
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

/** Press the field's own up chevron once and report what it wrote. */
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
    // A 0..1 fraction nudged by 8 is not a smaller bug than a gap nudged by 1.
    expect(nudge(h(EditorStepContext.Provider, { value: 8 }, field({ step: 0.05, value: 0.5 }))))
      .toBeCloseTo(0.55, 5);
  });

  it('is 1 with no provider above it, exactly as before the context existed', () => {
    expect(nudge(field({}))).toBe(11);
  });
});

/**
 * THE CALL-SITE AUDIT. A `ValueField` with no `step` now moves by the session's
 * step, so every call site is either a number IN PIXELS (which is what the strip is
 * for) or it names its own step. The two lists below are the review, kept as
 * code so the next field added has to join one of them.
 */
describe('every ValueField call site is either in pixels or names its step', () => {
  const files = (dir: string): string[] => readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? files(join(dir, e.name))
      : (e.name.endsWith('.tsx') ? [join(dir, e.name)] : [])));

  /** Fields whose value is NOT in HUD pixels: a fraction, a count, a duration,
   *  an angle. Each must pass a `step` of its own. */
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
    // The file is deleted; the assertion is that nothing imports it back.
    const all = files(ED).map((f) => readFileSync(f, 'utf8')).join('\n');
    expect(all).not.toContain("from './StepNumberInput'");
    expect(all).not.toContain('<StepNumberInput');
    // And the rule that hid `ValueInput`'s own spinner went with it.
    expect(readFileSync(`${ED}/sub-components/HudLayoutEditor.layout.css`, 'utf8'))
      .not.toContain('hud-value-input__spin');
  });
});
