/* @layer renderer-hud @kind component */
import { HudBox } from '../../primitives/HudBox';
import { outlineFilter } from '../../primitives/HudSprite';
import type { HudMagicMeterProps } from './HudMagicMeter.type';
import { MagicAccurate } from './sub-components/MagicAccurate';
import { MagicOriginal } from './sub-components/MagicOriginal';

const HudMagicMeter = (props: HudMagicMeterProps) => {
  const { value, mode, scale, spritesBase } = props;

  const tile = 8 * scale;
  const frameW = 3 * tile;
  const frameH = 6 * tile;

  const fillLevel = Math.min(Math.max((value + 7) >> 3, 0), 16);

  const inset = tile * 0.8;
  const interiorFill = (
    <HudBox style={{
      position: 'absolute',
      left: inset,
      top: inset,
      width: frameW - inset * 2,
      height: frameH - inset * 2,
      background: 'black',
      zIndex: 0,
    }} />
  );

  if (mode === 'original') {
    return (
      <HudBox style={{ width: frameW, height: frameH, position: 'relative', imageRendering: 'pixelated' as const }}>
        {interiorFill}
        <HudBox style={{ position: 'absolute', inset: 0, zIndex: 2, filter: outlineFilter(scale) }}>
          <MagicOriginal tile={tile} spritesBase={spritesBase} fillLevel={fillLevel} />
        </HudBox>
      </HudBox>
    );
  }

  return (
    <HudBox style={{ width: frameW, height: frameH, position: 'relative', imageRendering: 'pixelated' as const }}>
      {interiorFill}
      <MagicAccurate tile={tile} scale={scale} spritesBase={spritesBase} value={value} />
    </HudBox>
  );
};

export { HudMagicMeter };
