/* @layer renderer-components @kind logic */
import type { ReactNode } from 'react';
import type { GameSettings } from '@shared/types/settings';
import { DEFAULT_SETTINGS } from '@app/lib/game/settings';
import { SegmentedControl, Slider } from '@drizztdourden08/tessera/primitives';
import { DialogColorControl } from './dialog-color-control';
import { BORDER_OPTIONS, CORNER_OPTIONS, MARK_OPTIONS, THICKNESS_OPTIONS } from './hud-settings.constants';

const renderBorderControl = (key: string, settings: GameSettings, onChange: (patch: Partial<GameSettings>) => void, disabled: boolean): ReactNode | null => {
  switch (key) {
    case 'dialogBorder':
      return (
        <SegmentedControl
          label="Border"
          description="The game's tiles, no border, one line, or a thin line inside a thicker one"
          value={settings.dialogBorder}
          options={BORDER_OPTIONS}
          onChange={(v) => onChange({ dialogBorder: v as GameSettings['dialogBorder'] })}
          disabled={disabled}
        />
      );
    case 'dialogBorderThickness':
      return (
        <SegmentedControl
          label="Thickness"
          description="How heavy the drawn line is"
          value={settings.dialogBorderThickness}
          options={THICKNESS_OPTIONS}
          onChange={(v) => onChange({ dialogBorderThickness: v as GameSettings['dialogBorderThickness'] })}
          disabled={disabled}
        />
      );
    case 'dialogBorderColor':
      return (
        <DialogColorControl
          label="Border Color"
          description="The colour of the drawn line and the corner marks"
          value={settings.dialogBorderColor}
          original={DEFAULT_SETTINGS.dialogBorderColor}
          onChange={(hex) => onChange({ dialogBorderColor: hex })}
          disabled={disabled}
        />
      );
    case 'dialogCorner':
      return (
        <SegmentedControl
          label="Corners"
          description="Square, rounded, or cut at a diagonal"
          value={settings.dialogCorner}
          options={CORNER_OPTIONS}
          onChange={(v) => onChange({ dialogCorner: v as GameSettings['dialogCorner'] })}
          disabled={disabled}
        />
      );
    case 'dialogCornerMark':
      return (
        <SegmentedControl
          label="Corner Marks"
          description="A small mark inside each corner"
          value={settings.dialogCornerMark}
          options={MARK_OPTIONS}
          onChange={(v) => onChange({ dialogCornerMark: v as GameSettings['dialogCornerMark'] })}
          disabled={disabled}
        />
      );
    case 'dialogCornerMarkAngle':
      return (
        <Slider
          label="Mark Angle"
          description="Turns the marks; each corner mirrors the top-left one"
          value={settings.dialogCornerMarkAngle}
          min={0}
          max={345}
          step={15}
          formatValue={(v) => v + ' deg'}
          onChange={(v) => onChange({ dialogCornerMarkAngle: v })}
          disabled={disabled}
        />
      );
    default:
      return null;
  }
};

export { renderBorderControl };
