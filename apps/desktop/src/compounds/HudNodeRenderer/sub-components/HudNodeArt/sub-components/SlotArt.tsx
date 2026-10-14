/* @layer renderer-hud @kind component */
import { HudSprite } from '../../../../../primitives/HudSprite';
import type { SlotArtProps } from '../HudNodeArt.type';

const SlotArt = ({ spec, content, dimmed, tile, scale, spritesBase }: SlotArtProps) => {
  const held = content.slots[spec.index];
  if (!held || held.role === 'none' || !held.itemSprite) return null;
  const quiet = held.dimmed || dimmed;
  return (
    <HudSprite
      src={`${spritesBase}${held.itemSprite}.png`}
      width={tile} height={tile}
      outline={!quiet} silhouette={quiet} scale={scale}
    />
  );
};

export { SlotArt };
