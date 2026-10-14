/* @layer renderer-components @kind component */
import { outlineSummary, swatchOf } from '@app/hud-layout-editing/appearance-summary';
import { HUD_WHITE } from '../HudLayoutEditor.constants';
import { MAX_OUTLINE_PX } from './AppearanceSection.constants';
import { PaintField } from './PaintField';
import { SubsectionGroup } from './SubsectionGroup';
import { ValueField } from './ValueField';
import type { StyleGroupProps } from './StyleGroup.type';

const OutlineGroup = (props: StyleGroupProps) => {
  const { style, setStyle, open, onToggle, onEnable, scope, insideRepeat } = props;
  const { outline } = style;

  return (
    <SubsectionGroup
      title="Outline" summary={outlineSummary(outline)} swatch={swatchOf(outline?.color)}
      open={open} onToggle={onToggle} enabled={outline !== undefined}
      onEnabledChange={(on) => onEnable(on, { outline: on ? { width: 1, color: HUD_WHITE } : undefined })}
    >
      {outline && (
        <>
          <ValueField label="width" value={outline.width} onChange={(width) => setStyle({ outline: { ...outline, width } })} scope={scope} insideRepeat={insideRepeat} min={0} max={MAX_OUTLINE_PX} step={0.5} />
          <PaintField label="colour" value={outline.color} onChange={(color) => setStyle({ outline: { ...outline, color } })} scope={scope} insideRepeat={insideRepeat} />
        </>
      )}
    </SubsectionGroup>
  );
};

export { OutlineGroup };
