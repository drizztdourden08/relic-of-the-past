/* @layer renderer-hud @kind component */
/**
 * Renders a multi-tile label strip (condensed HUD text).
 * Labels are pre-composed sprites where each 8×8 tile contains ~2 characters.
 */

interface PauseLabelProps {
  name: string;
  tiles: number;
  scale: number;
  spritesBase: string;
}

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
export type { PauseLabelProps };
