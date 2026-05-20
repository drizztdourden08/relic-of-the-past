/**
 * PauseButtonLabel — Y/X button indicator with label text.
 * Shows the button letter sprite in its associated color.
 */

interface PauseButtonLabelProps {
  button: 'y' | 'x' | 'a';
  scale: number;
  spritesBase: string;
}

const PauseButtonLabel = ({ button, scale, spritesBase }: PauseButtonLabelProps) => {
  const tile = 8 * scale;
  const src = `${spritesBase}pause-btn-${button}.png`;

  // Button sprites are vertical strips: 8px wide × 16px tall (2 tiles)
  return (
    <img
      src={src}
      width={tile}
      height={tile * 2}
      draggable={false}
      style={{ display: 'block', imageRendering: 'pixelated' }}
    />
  );
};

export { PauseButtonLabel };
export type { PauseButtonLabelProps };
