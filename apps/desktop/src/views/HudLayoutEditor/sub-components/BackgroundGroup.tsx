/* @layer renderer-components @kind component */
import { paintText, swatchOf } from '@app/hud-layout-editing/appearance-summary';
import { HUD_BLACK } from '../HudLayoutEditor.constants';
import { PaintField } from './PaintField';
import { SubsectionGroup } from './SubsectionGroup';
import type { StyleGroupProps } from './StyleGroup.type';

const BackgroundGroup = (props: StyleGroupProps) => {
  const { style, setStyle, open, onToggle, onEnable, scope, insideRepeat } = props;
  const { background } = style;

  return (
    <SubsectionGroup
      title="Background" summary={background === undefined ? 'off' : paintText(background)}
      swatch={swatchOf(background)} open={open} onToggle={onToggle}
      enabled={background !== undefined}
      onEnabledChange={(on) => onEnable(on, { background: on ? HUD_BLACK : undefined })}
    >
      {background !== undefined && (
        <PaintField value={background} onChange={(next) => setStyle({ background: next })} scope={scope} insideRepeat={insideRepeat} kinds />
      )}
    </SubsectionGroup>
  );
};

export { BackgroundGroup };
