/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PositionInput } from '../../../apps/web/src/ui/design-system/primitives/PositionInput';
import type { PositionInputProps } from '../../../apps/web/src/ui/design-system/primitives/PositionInput';
import { GRID, SIGNED } from './position-input.constants';

const render = (props: Partial<PositionInputProps> = {}): string =>
  renderToStaticMarkup(
    createElement(PositionInput, {
      value: { x: 3, y: 4 },
      onChange: () => undefined,
      ...props,
    }),
  );

const attrs = (markup: string): string[] => markup.match(/<input[^>]*>/g) ?? [];

describe('rendering the markup a screen binds to', () => {
  it('renders two fields as one labelled group', () => {
    const markup = render({ label: 'Grid position', x: GRID, y: GRID });
    expect(attrs(markup)).toHaveLength(2);
    expect(markup).toContain('role="group"');
    expect(markup).toContain('aria-label="Grid position"');
    expect(markup).toContain('Grid position');
  });

  it('caps the axes X and Y by default, and takes an override', () => {
    expect(render()).toContain('>X<');
    expect(render()).toContain('>Y<');
    const named = render({ x: { label: 'Col' }, y: { label: 'Row' } });
    expect(named).toContain('>Col<');
    expect(named).toContain('>Row<');
  });

  it('puts each axis bound on its own field', () => {
    const [first, second] = attrs(render({ x: GRID, y: SIGNED }));
    expect(first).toContain('min="0"');
    expect(first).toContain('max="63"');
    expect(second).toContain('min="-8"');
    expect(second).toContain('max="8"');
  });

  it('renders an axis with no bounds at all, leaving both ends open', () => {
    const markup = render();
    expect(attrs(markup)).toHaveLength(2);
    expect(markup).not.toContain('min=');
    expect(markup).not.toContain('max=');
  });

  it('renders with a bound on one end only', () => {
    const [first] = attrs(render({ x: { min: 0 } }));
    expect(first).toContain('min="0"');
    expect(first).not.toContain('max=');
  });

  it('steps by one unless the axis says otherwise', () => {
    expect(attrs(render())[0]).toContain('step="1"');
    const stepped = attrs(render({ x: { ...GRID, step: 8 }, y: GRID }));
    expect(stepped[0]).toContain('step="8"');
    expect(stepped[1]).toContain('step="1"');
  });

  it('shows the value it was given on each axis', () => {
    const [first, second] = attrs(render({ value: { x: 12, y: 34 } }));
    expect(first).toContain('value="12"');
    expect(second).toContain('value="34"');
  });

  it('renders an empty field instead of NaN for a broken value', () => {
    const [first] = attrs(render({ value: { x: Number.NaN, y: 0 } }));
    expect(first).toContain('value=""');
  });

  it('makes both axes inert when disabled, including fields and spinners', () => {
    const markup = render({ disabled: true, x: GRID, y: GRID });
    expect(attrs(markup).every((tag) => tag.includes('disabled'))).toBe(true);
    const twoChevronsPerAxis = 4;
    expect(markup.match(/<button[^>]*disabled/g)).toHaveLength(twoChevronsPerAxis);
    expect(markup).toContain('position-input--disabled');
  });

  it('leaves both axes interactive by default', () => {
    const markup = render();
    expect(attrs(markup).some((tag) => tag.includes('disabled'))).toBe(false);
    expect(markup).not.toContain('position-input--disabled');
  });
});
