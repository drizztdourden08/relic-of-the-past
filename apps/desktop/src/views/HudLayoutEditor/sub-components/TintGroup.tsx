/* @layer renderer-components @kind component */
import { Field, Select } from '@drizztdourden08/tessera/primitives';
import { swatchOf, tintSummary } from '@app/hud-layout-editing/appearance-summary';
import { HUD_WHITE } from '../HudLayoutEditor.constants';
import { PaintField } from './PaintField';
import { SubsectionGroup } from './SubsectionGroup';
import { ValueField } from './ValueField';
import type { HudTintMode } from '@rotp/hud';
import type { StyleGroupProps } from './StyleGroup.type';

const TintGroup = (props: StyleGroupProps) => {
  const { style, setStyle, open, onToggle, onEnable, scope, insideRepeat } = props;
  const { tint } = style;

  return (
    <SubsectionGroup
      title="Tint" summary={tintSummary(tint)} swatch={swatchOf(tint?.color)}
      open={open} onToggle={onToggle} enabled={tint !== undefined}
      onEnabledChange={(on) => onEnable(on, { tint: on ? { color: HUD_WHITE } : undefined })}
    >
      {tint && (
        <>
          <PaintField label="colour" value={tint.color} onChange={(color) => setStyle({ tint: { ...tint, color } })} scope={scope} insideRepeat={insideRepeat} />
          <Field size="sm" label="mode">
            <Select size="sm" value={tint.mode ?? 'multiply'} options={[{ value: 'multiply', label: 'multiply' }, { value: 'replace', label: 'replace' }]} onChange={(mode) => setStyle({ tint: { ...tint, mode: mode as HudTintMode } })} />
          </Field>
          <ValueField label="amount" value={tint.amount ?? 1} onChange={(amount) => setStyle({ tint: { ...tint, amount } })} scope={scope} insideRepeat={insideRepeat} min={0} max={1} step={0.05} />
        </>
      )}
    </SubsectionGroup>
  );
};

export { TintGroup };
