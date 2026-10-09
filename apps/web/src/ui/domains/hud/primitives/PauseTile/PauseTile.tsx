/* @layer renderer-hud @kind component */
import type { PauseTileProps } from './PauseTile.type';

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
