/* @layer renderer-components @kind types */
import type { HudBoxStyle, Value } from '@rotp/hud';

interface RadiusFieldsProps {
  boxStyle: HudBoxStyle;
  setStyle: (patch: HudBoxStyle) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
}

type Corners = [Value, Value, Value, Value];

export type { Corners, RadiusFieldsProps };
