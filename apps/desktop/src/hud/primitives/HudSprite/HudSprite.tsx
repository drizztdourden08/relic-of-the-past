/**
 * HudSprite — renders a single sprite image with pixel-perfect scaling.
 * Optionally adds a 1px (scaled) black outline/background behind the sprite.
 */

interface HudSpriteProps {
  src: string;
  width: number;
  height: number;
  outline?: boolean;
  scale: number;
}

const HudSprite = (props: HudSpriteProps) => {
  const { src, width, height, outline = false, scale } = props;
  const border = outline ? scale : 0;

  if (!outline) {
    return (
      <img
        src={src}
        width={width}
        height={height}
        draggable={false}
        style={{ display: 'block', imageRendering: 'pixelated' }}
      />
    );
  }

  return (
    <div style={{
      position: 'relative',
      width: width + border * 2,
      height: height + border * 2,
      background: '#000',
      imageRendering: 'pixelated',
    }}>
      <img
        src={src}
        width={width}
        height={height}
        draggable={false}
        style={{
          display: 'block',
          imageRendering: 'pixelated',
          position: 'relative',
          left: border,
          top: border,
        }}
      />
    </div>
  );
};

export { HudSprite };
export type { HudSpriteProps };
