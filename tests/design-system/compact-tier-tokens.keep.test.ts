/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DS = resolve(__dirname, '../../apps/web/src/ui/design-system');

const CTL_PREFIX = `--${'ctl'}-`;

const sheet = (relative: string): string => readFileSync(resolve(DS, relative), 'utf8');

const TOKENS = sheet('tokens/size.css');
const SPACE = sheet('tokens/space.css');
const TEXT_INPUT = sheet('primitives/TextInput/TextInput.css');
const NUMBER_INPUT = sheet('primitives/NumberInput/NumberInput.css');
const SEGMENTED = sheet('primitives/SegmentedControl/SegmentedControl.css');
const TOGGLE = sheet('primitives/Toggle/Toggle.css');
const CHECKBOX = sheet('primitives/Checkbox/Checkbox.css');
const SWATCH = sheet('primitives/ColorSwatch/ColorSwatch.css');
const FIELD = sheet('primitives/Field/Field.css');
const EMPTY = sheet('primitives/EmptyState/EmptyState.css');

describe('the four token additions', () => {
  it('names both control heights', () => {
    expect(TOKENS).toContain('--control-h-sm: 26px;');
    expect(TOKENS).toContain('--control-h-md: 34px;');
  });

  it('names the three icon boxes already drawn in the app', () => {
    expect(TOKENS).toContain('--icon-sm: 12px;');
    expect(TOKENS).toContain('--icon-md: 16px;');
    expect(TOKENS).toContain('--icon-lg: 20px;');
  });

  it('keeps --space-2xs at the 2px the SpaceToken union now names', () => {
    expect(SPACE).toContain('--space-2xs:  2px;');
  });

  it("names '2xs' in the SpaceToken union", () => {
    expect(sheet('primitives/Flex/Flex.type.ts'))
      .toContain("type SpaceToken = '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';");
  });

  it("gives '2xs' a rule everywhere SpaceToken is consumed", () => {
    expect(sheet('primitives/Flex/Flex.css')).toContain(".flex[data-gap='2xs'] { gap: var(--space-2xs); }");
    expect(sheet('primitives/Grid/Grid.css')).toContain(".grid[data-gap='2xs'] { gap: var(--space-2xs); }");
    expect(sheet('primitives/Spacer/Spacer.css')).toContain(".spacer[data-size='2xs']");
  });
});

describe('md survives untouched behind every --ctl-* fallback', () => {
  it('TextInput still draws 8/12 padding, 13px text, a 6px radius and no height', () => {
    expect(TEXT_INPUT).toContain('min-height: var(--ctl-h, auto);');
    expect(TEXT_INPUT).toContain('padding: var(--ctl-pad-y, var(--space-sm)) var(--ctl-pad-x, var(--space-md));');
    expect(TEXT_INPUT).toContain('border-radius: var(--ctl-radius, var(--radius-md));');
    expect(TEXT_INPUT).toContain('font-size: var(--ctl-font, var(--text-base));');
  });

  it('NumberInput keeps its field padding, its font, its radius and its ch-width arithmetic', () => {
    expect(NUMBER_INPUT).toContain('min-height: var(--ctl-h, auto);');
    expect(NUMBER_INPUT).toContain('border-radius: var(--ctl-radius, var(--radius-md));');
    expect(NUMBER_INPUT).toContain('padding: var(--ctl-pad-y, var(--space-sm)) var(--ctl-pad-x, var(--space-md));');
    expect(NUMBER_INPUT).toContain('font-size: var(--ctl-font, var(--text-base));');
    expect(NUMBER_INPUT).toContain('width: calc((var(--number-input-columns) * 1ch) + (var(--ctl-pad-x, var(--space-md)) * 2) + 0.75ch);');
  });

  it("SegmentedControl's track keeps its 6px radius and gains no height at md", () => {
    expect(SEGMENTED).toContain('min-height: var(--ctl-h, auto);');
    expect(SEGMENTED).toContain('border-radius: var(--ctl-radius, var(--radius-md));');
  });

  it('Toggle still measures 36 x 20 with a 14px thumb travelling 16px', () => {
    expect(TOGGLE).toContain('width: var(--toggle-track-w, 36px);');
    expect(TOGGLE).toContain('height: var(--toggle-track-h, 20px);');
    expect(TOGGLE).toContain('width: var(--toggle-thumb, 14px);');
    expect(TOGGLE).toContain('height: var(--toggle-thumb, 14px);');
    expect(TOGGLE).toContain('top: var(--toggle-inset, 2px);');
    expect(TOGGLE).toContain('left: var(--toggle-inset, 2px);');
    expect(TOGGLE).toContain('transform: translateX(var(--toggle-travel, 16px));');
  });

  it('Checkbox still draws a 14px box', () => {
    expect(CHECKBOX).toContain('width: var(--checkbox-box, 14px);');
    expect(CHECKBOX).toContain('height: var(--checkbox-box, 14px);');
  });

  it('ColorSwatch still falls back to 28px, and md sets --swatch-size nowhere', () => {
    expect(SWATCH).toContain('width: var(--swatch-size, 28px);');
    expect(SWATCH).toContain('height: var(--swatch-size, 28px);');
    expect(SWATCH.match(/--swatch-size:/g)).toHaveLength(1);
    expect(SWATCH).toContain('.color-swatch--sm {\n  --swatch-size: var(--icon-md);');
  });
});

describe('sm resolves to the tier .btn--sm and .select-trigger--sm already draw', () => {
  const CTL_SM = [
    '--ctl-h: var(--control-h-sm);',
    '--ctl-pad-y: var(--space-xs);',
    '--ctl-pad-x: var(--space-sm);',
    '--ctl-font: var(--text-sm);',
    '--ctl-radius: var(--radius-sm);',
  ];

  it('TextInput sm is 26px tall, 4/8 padded, 11px, 4px radius', () => {
    for (const declaration of CTL_SM) expect(TEXT_INPUT).toContain(declaration);
  });

  it('NumberInput sm is the same, plus a spinner column tightened to 4px', () => {
    for (const declaration of CTL_SM) expect(NUMBER_INPUT).toContain(declaration);
    expect(NUMBER_INPUT).toContain('.number-input--sm .number-input__btn {\n  padding: 0 var(--space-xs);');
  });

  it('SegmentedControl sm takes the height and radius, and closes the 16px label gap to 8', () => {
    expect(SEGMENTED).toContain('--ctl-h: var(--control-h-sm);');
    expect(SEGMENTED).toContain('--ctl-radius: var(--radius-sm);');
    expect(SEGMENTED).toContain('gap: var(--space-sm);');
    expect(SEGMENTED).toContain('.segmented--sm .segmented__track {\n  padding: var(--space-2xs);');
    expect(SEGMENTED).toContain('.segmented--sm .segmented__btn {\n  padding: var(--space-2xs) var(--space-sm);');
  });

  it('Toggle sm is a 28 x 16 track with a 12px thumb travelling 12px', () => {
    expect(TOGGLE).toContain('--toggle-track-w: 28px;');
    expect(TOGGLE).toContain('--toggle-track-h: var(--icon-md);');
    expect(TOGGLE).toContain('--toggle-thumb: var(--icon-sm);');
    expect(TOGGLE).toContain('--toggle-inset: 1px;');
    expect(TOGGLE).toContain('--toggle-travel: 12px;');
  });

  it('Checkbox sm is a 12px box, which is the small icon token', () => {
    expect(CHECKBOX).toContain('--checkbox-box: var(--icon-sm);');
  });

  it('ColorSwatch sm is 16px, set on the variable ColorPicker already uses', () => {
    expect(SWATCH).toContain('--swatch-size: var(--icon-md);');
  });

  it('Field sm tightens its gaps only, and beats .field--inline on specificity', () => {
    expect(FIELD).toContain('.field--sm {\n  gap: var(--space-2xs);');
    expect(FIELD).toContain('.field--sm.field--inline {\n  gap: var(--space-xs);');
    expect(FIELD).not.toContain(CTL_PREFIX);
  });

  it('EmptyState sm steps one rung down on every axis', () => {
    expect(EMPTY).toContain('.empty-state--sm {\n  gap: var(--space-xs);\n  padding: var(--space-sm);\n  font-size: var(--text-xs);');
    expect(EMPTY).not.toContain(CTL_PREFIX);
  });
});

describe('the --ctl-* seam cannot reach a control that did not ask for it', () => {
  const WRITERS = [
    ['TextInput', TEXT_INPUT, '.text-input--sm'],
    ['NumberInput', NUMBER_INPUT, '.number-input--sm'],
    ['SegmentedControl', SEGMENTED, '.segmented--sm'],
  ] as const;

  const declaresCtl = new RegExp(`(^|\\n)\\s*${CTL_PREFIX}`);

  for (const [name, css, selector] of WRITERS) {
    it(`${name} declares the control variables only inside ${selector}`, () => {
      for (const block of css.split('}')) {
        if (!declaresCtl.test(block)) continue;
        expect(block, `control variable declared outside ${selector}`).toContain(selector);
      }
    });
  }
});
