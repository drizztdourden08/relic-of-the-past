/* @layer shared-game @kind types */
interface SpriteSource {
  base: string;
  revision: number;
}

interface ResolvedItemSprite {
  obtained: boolean;
  sprite: string;
}

export type { ResolvedItemSprite, SpriteSource };
