/* @layer renderer-hud @kind types */
interface HudMeterProps {
  width: number;
  height: number;
  fraction: number;
  frame: number;
  radius: number;
  frameColor: string;
  fillColor: string;
  sheenColor: string;
  sheenOpacity: number;
  bands?: number;
  scale: number;
}

interface MeterBand {
  y: number;
  h: number;
}

export type { HudMeterProps, MeterBand };
