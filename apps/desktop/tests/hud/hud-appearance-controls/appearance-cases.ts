/* @layer tests @kind helper */
import { createElement as h, type ReactNode } from 'react';
import { AppearanceSection } from '@app/views/HudLayoutEditor/sub-components/AppearanceSection';
import { GradientRamp } from '@app/views/HudLayoutEditor/sub-components/GradientRamp';
import { PaintField } from '@app/views/HudLayoutEditor/sub-components/PaintField';
import { SidesField } from '@app/views/HudLayoutEditor/sub-components/SidesField';
import { SlotChips } from '@app/views/HudLayoutEditor/sub-components/SlotChips';
import { SubsectionGroup } from '@app/views/HudLayoutEditor/sub-components/SubsectionGroup';
import { ValueField } from '@app/views/HudLayoutEditor/sub-components/ValueField';
import type { HudNode } from '@rotp/hud';

const noop = (): void => {};
const scope = { life_current: 8 };

const loaded: HudNode = {
  kind: 'container', id: 'panel', direction: 'row', children: [], opacity: 0.8,
  dimWhenEmpty: [5, 6, 7, 8],
  style: {
    background: '#101010',
    border: { width: 2, color: '#c8a84e', style: 'solid', sides: { top: true, right: true, bottom: true, left: false } },
    radius: 4,
    outline: { width: 1, color: '#f4f4f4' },
    tint: { color: '#ff8080', mode: 'multiply', amount: 1 },
    shadow: [{ x: 0, y: 2, blur: 4, color: '#000000' }, { x: 0, y: 0, blur: 8, color: '#c8a84e', inset: true }],
    clip: true,
  },
};

const group = (title: string, summary: string, swatch: string, ...body: ReactNode[]): ReactNode =>
  h(SubsectionGroup, { key: title, title, summary, swatch, open: true, onToggle: noop, enabled: true, onEnabledChange: noop }, ...body);

const shadowBody = (i: number): ReactNode[] => {
  const shadow = (loaded.style?.shadow ?? [])[i];
  return [
    h('div', { key: 'g', className: 'grid' },
      ...(['x', 'y', 'blur', 'spread'] as const).map((k) => h(ValueField, {
        key: k, label: k, value: shadow[k] ?? 0, onChange: noop, scope,
      }))),
    h(PaintField, { key: 'c', label: `shadow ${i + 1} colour`, value: shadow.color, onChange: noop, scope }),
  ];
};

const expanded = (): ReactNode => h('div', { className: 'hud-inspect__group' },
  group('Background', '#101010', '#101010',
    h(PaintField, { key: 'p', label: 'background', value: '#101010', onChange: noop, scope, kinds: true })),
  group('Border', '2px solid, no left', '#c8a84e',
    h(ValueField, { key: 'w', label: 'width', value: 2, onChange: noop, scope, min: 0 }),
    h(PaintField, { key: 'c', label: 'border colour', value: '#c8a84e', onChange: noop, scope }),
    h(SidesField, { key: 's', label: 'sides', value: { left: false }, onChange: noop })),
  group('Outline', '1px, ink', '#f4f4f4',
    h(ValueField, { key: 'w', label: 'width', value: 1, onChange: noop, scope, min: 0 }),
    h(PaintField, { key: 'c', label: 'outline colour', value: '#f4f4f4', onChange: noop, scope })),
  group('Tint', 'multiply 1', '#ff8080',
    h(PaintField, { key: 'c', label: 'tint colour', value: '#ff8080', onChange: noop, scope }),
    h(ValueField, { key: 'a', label: 'amount', value: 1, onChange: noop, scope, min: 0, max: 1 })),
  group('Shadow 1', '0 2 4 #000000', '#000000', ...shadowBody(0)),
  group('Shadow 2', '0 0 8 #c8a84e inset', '#c8a84e', ...shadowBody(1)));

const appearanceCases: Record<string, () => unknown> = {
  section: () => h(AppearanceSection, { node: loaded, onPatch: noop, scope }),
  expanded,
  borderOpen: () => h(SubsectionGroup, {
    title: 'Border', summary: '2px solid, no left', swatch: '#c8a84e', open: true, onToggle: noop,
    enabled: true, onEnabledChange: noop,
  }, h(PaintField, { label: 'colour', value: '#c8a84e', onChange: noop, scope }),
    h(SidesField, { label: 'sides', value: { left: false }, onChange: noop })),
  gradient: () => h(PaintField, {
    label: 'background', kinds: true, onChange: noop, scope,
    value: { gradient: 'linear', angle: 0, stops: [{ at: 0, color: '#ffffff' }, { at: 1, color: '#000000' }] },
  }),
  ramp: () => h(GradientRamp, {
    kind: 'linear', onChange: noop,
    stops: [{ at: 0, color: '#ffffff' }, { at: 0.5, color: '#c8a84e' }, { at: 1, color: '#000000' }],
  }),
  chips: () => h(SlotChips, { label: 'dim when empty', value: [5, 6, 7, 8], onChange: noop }),
  sides: () => h(SidesField, { label: 'sides', value: undefined, onChange: noop }),
};

export { appearanceCases };
