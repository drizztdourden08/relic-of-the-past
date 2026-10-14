/* @layer renderer-components @kind component */
import { Field, Select } from '@drizztdourden08/tessera/primitives';
import { borderSummary, swatchOf } from '@app/hud-layout-editing/appearance-summary';
import { HUD_WHITE } from '../HudLayoutEditor.constants';
import { BORDER_STYLES } from './AppearanceSection.constants';
import { PaintField } from './PaintField';
import { SidesField } from './SidesField';
import { SubsectionGroup } from './SubsectionGroup';
import { ValueField } from './ValueField';
import type { HudBorderStyle } from '@rotp/hud';
import type { StyleGroupProps } from './StyleGroup.type';

const BorderGroup = (props: StyleGroupProps) => {
  const { style, setStyle, open, onToggle, onEnable, scope, insideRepeat } = props;
  const { border } = style;

  return (
    <SubsectionGroup
      title="Border" summary={borderSummary(border)} swatch={swatchOf(border?.color)}
      open={open} onToggle={onToggle} enabled={border !== undefined}
      onEnabledChange={(on) => onEnable(on, { border: on ? { width: 1, color: HUD_WHITE } : undefined })}
    >
      {border && (
        <>
          <ValueField label="width" value={border.width} onChange={(width) => setStyle({ border: { ...border, width } })} scope={scope} insideRepeat={insideRepeat} min={0} />
          <PaintField label="colour" value={border.color} onChange={(color) => setStyle({ border: { ...border, color } })} scope={scope} insideRepeat={insideRepeat} />
          <Field size="sm" label="style">
            <Select size="sm" value={border.style ?? 'solid'} options={BORDER_STYLES.map((v) => ({ value: v, label: v }))} onChange={(v) => setStyle({ border: { ...border, style: v as HudBorderStyle } })} />
          </Field>
          <SidesField label="sides" value={border.sides} onChange={(sides) => setStyle({ border: { ...border, sides } })} />
        </>
      )}
    </SubsectionGroup>
  );
};

export { BorderGroup };
