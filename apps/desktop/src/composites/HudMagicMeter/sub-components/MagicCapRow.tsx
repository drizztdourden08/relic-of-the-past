/* @layer renderer-hud @kind component */
import { HudImage } from '../../../primitives/HudImage';
import { MAGIC_CAP_SPRITES } from '../HudMagicMeter.constants';
import type { MagicCapRowProps } from '../HudMagicMeter.type';

const MagicCapRow = ({ edge, tile, spritesBase }: MagicCapRowProps) => (
  <>
    {MAGIC_CAP_SPRITES[edge].map((name, column) => (
      <HudImage
        key={name}
        src={`${spritesBase}${name}.png`}
        width={tile}
        height={tile}
        style={{
          position: 'absolute',
          left: tile * column,
          top: edge === 'top' ? 0 : tile * 5,
          imageRendering: 'pixelated',
        }}
      />
    ))}
  </>
);

export { MagicCapRow };
