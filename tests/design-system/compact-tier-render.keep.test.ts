/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { createElement, type ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TextInput } from '../../apps/web/src/ui/design-system/primitives/TextInput/TextInput';
import { NumberInput } from '../../apps/web/src/ui/design-system/primitives/NumberInput/NumberInput';
import { SegmentedControl } from '../../apps/web/src/ui/design-system/primitives/SegmentedControl/SegmentedControl';
import { Toggle } from '../../apps/web/src/ui/design-system/primitives/Toggle/Toggle';
import { Checkbox } from '../../apps/web/src/ui/design-system/primitives/Checkbox/Checkbox';
import { ColorSwatch } from '../../apps/web/src/ui/design-system/primitives/ColorSwatch/ColorSwatch';
import { Field } from '../../apps/web/src/ui/design-system/primitives/Field/Field';
import { EmptyState } from '../../apps/web/src/ui/design-system/primitives/EmptyState/EmptyState';

type Props = Record<string, unknown>;

const noop = (): void => undefined;

const render = (component: unknown, props: Props): string =>
  renderToStaticMarkup(createElement(component as ComponentType<Props>, props));

const rootClass = (markup: string): string => /class="([^"]*)"/.exec(markup)?.[1] ?? '';

interface Case {
  name: string;
  component: unknown;
  props: Props;
  markup: string;
  smClass: string;
}

const CASES: Case[] = [
  {
    name: 'TextInput',
    component: TextInput,
    props: { value: 'x', onChange: noop },
    markup: '<input class="text-input " value="x"/>',
    smClass: 'text-input text-input--sm ',
  },
  {
    name: 'NumberInput',
    component: NumberInput,
    props: { value: 1, onChange: noop },
    markup: '<div class="number-input   "><input type="number" class="number-input__field" value="1"/>'
      + '<div class="number-input__spin">'
      + '<button type="button" class="number-input__btn" tabindex="-1" aria-label="Increment">'
      + '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"'
      + ' stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 9.75 8 5.25l4.5 4.5"></path></svg></button>'
      + '<button type="button" class="number-input__btn" tabindex="-1" aria-label="Decrement">'
      + '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"'
      + ' stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 6.25 8 10.75l4.5-4.5"></path></svg>'
      + '</button></div></div>',
    smClass: 'number-input number-input--sm   ',
  },
  {
    name: 'SegmentedControl',
    component: SegmentedControl,
    props: { value: 'a', options: [{ value: 'a', label: 'A' }], onChange: noop, label: 'L' },
    markup: '<div class="segmented "><div class="segmented__header"><span class="segmented__label">L</span></div>'
      + '<div class="segmented__track" role="radiogroup" aria-label="L"><span class="segmented__indicator"></span>'
      + '<button type="button" role="radio" aria-checked="true" class="segmented__btn segmented__btn--active">A</button>'
      + '</div></div>',
    smClass: 'segmented segmented--sm ',
  },
  {
    name: 'Toggle',
    component: Toggle,
    props: { checked: false, onChange: noop, label: 'L', id: 'toggle-l' },
    markup: '<label class="toggle " for="toggle-l"><span class="toggle__text"><span class="toggle__label">L</span></span>'
      + '<input id="toggle-l" type="checkbox" class="toggle__input" role="switch" aria-checked="false"/>'
      + '<span class="toggle__track"><span class="toggle__thumb"></span></span></label>',
    smClass: 'toggle toggle--sm ',
  },
  {
    name: 'Checkbox',
    component: Checkbox,
    props: { checked: false, onChange: noop, label: 'L' },
    markup: '<label class="checkbox"><input type="checkbox" class="checkbox__input"/>'
      + '<span class="checkbox__label">L</span></label>',
    smClass: 'checkbox checkbox--sm',
  },
  {
    name: 'ColorSwatch',
    component: ColorSwatch,
    props: { color: 'var(--c-gold)' },
    markup: '<button type="button" class="color-swatch" style="background:var(--c-gold)"></button>',
    smClass: 'color-swatch color-swatch--sm',
  },
  {
    name: 'Field',
    component: Field,
    props: { children: 'x', label: 'L' },
    markup: '<div class="field"><label class="field__label">L</label><div class="field__control">x</div></div>',
    smClass: 'field field--sm',
  },
  {
    name: 'EmptyState',
    component: EmptyState,
    props: { message: 'nothing' },
    markup: '<div class="empty-state"><div class="empty-state__message">nothing</div></div>',
    smClass: 'empty-state empty-state--sm',
  },
];

describe('the compact tier `md` is the default and it is the old rendering', () => {
  for (const c of CASES) {
    it(`${c.name} renders its pre-tier markup when \`size\` is omitted`, () => {
      expect(render(c.component, c.props)).toBe(c.markup);
    });

    it(`${c.name} renders the same for an explicit size="md"`, () => {
      expect(render(c.component, { ...c.props, size: 'md' })).toBe(c.markup);
    });

    it(`${c.name} emits no size class at md because the base class IS the md tier`, () => {
      expect(rootClass(render(c.component, c.props))).not.toContain('--sm');
      expect(rootClass(render(c.component, c.props))).not.toContain('--md');
    });
  }
});

describe('the compact tier `sm` adds one modifier class and changes nothing else', () => {
  for (const c of CASES) {
    it(`${c.name} adds exactly its --sm class`, () => {
      const sm = render(c.component, { ...c.props, size: 'sm' });
      expect(rootClass(sm)).toBe(c.smClass);
      expect(sm.replace(c.smClass, rootClass(c.markup))).toBe(c.markup);
    });
  }
});

describe('the compact tier `size` prop never reaches the DOM as an attribute', () => {
  it('TextInput does not emit size="sm"', () => {
    expect(render(TextInput, { value: 'x', onChange: noop, size: 'sm' })).not.toContain('size=');
  });

  it('NumberInput does not emit size="sm"', () => {
    expect(render(NumberInput, { value: 1, onChange: noop, size: 'sm' })).not.toContain(' size=');
  });

  it('TextInput htmlSize emits the native attribute', () => {
    expect(render(TextInput, { value: 'x', onChange: noop, htmlSize: 4 })).toContain('size="4"');
  });

  it('NumberInput htmlSize emits the native attribute', () => {
    expect(render(NumberInput, { value: 1, onChange: noop, htmlSize: 4 })).toContain('size="4"');
  });
});
