/**
 * PauseTile — renders a single 8×8 HUD tile with optional h/v flip.
 * Base primitive for all pause menu sprite rendering.
 */

interface PauseTileProps {
  src: string;
  scale: number;
  flipX?: boolean;
  flipY?: boolean;
}

const PauseTile = ({ src, scale, flipX = false, flipY = false }: PauseTileProps) => {
  const size = 8 * scale;
  const transforms: string[] = [];
  if (flipX) transforms.push('scaleX(-1)');
  if (flipY) transforms.push('scaleY(-1)');

  return (
    <img
      src={src}
      width={size}
      height={size}
      draggable={false}
      style={{
        display: 'block',
        imageRendering: 'pixelated',
        transform: transforms.length ? transforms.join(' ') : undefined,
      }}
    />
  );
};

export { PauseTile };
export type { PauseTileProps };
