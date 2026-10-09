/* @layer renderer-hud @kind component */
import type { PauseLabelProps } from './PauseLabel.type';

const PauseLabel = ({ name, tiles, scale, spritesBase }: PauseLabelProps) => {
  const tile = 8 * scale;

  return (
    <img
      src={`${spritesBase}pause-label-${name}.png`}
      width={tile * tiles}
      height={tile}
      draggable={false}
      style={{ display: 'block', imageRendering: 'pixelated' }}
    />
  );
};

export { PauseLabel };
