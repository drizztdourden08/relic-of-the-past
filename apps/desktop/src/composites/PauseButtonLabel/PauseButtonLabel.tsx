/* @layer renderer-hud @kind component */
import { HudImage } from '../../primitives/HudImage';
import type { PauseButtonLabelProps } from './PauseButtonLabel.type';

const PauseButtonLabel = ({ button, scale, spritesBase }: PauseButtonLabelProps) => {
  const tile = 8 * scale;
  const src = `${spritesBase}pause-btn-${button}.png`;

  return (
    <HudImage
      src={src}
      width={tile}
      height={tile * 2}
      block
      pixelated
    />
  );
};

export { PauseButtonLabel };
