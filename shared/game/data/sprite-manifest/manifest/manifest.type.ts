/* @layer shared-game @kind types */
import type { SpriteBox } from '../sprite-box';

type SpriteCategory = 'hud' | 'hud-pause' | 'hud-item' | 'fonts' | 'receipt' | 'drop' | 'randomizer' | 'title' | 'ground';

interface SpriteManifestEntry {
  file: string;
  label: string;
  category: SpriteCategory;
  box?: SpriteBox;
}

interface SpriteDefinition extends SpriteManifestEntry {
  extract: unknown;
}

export type { SpriteCategory, SpriteDefinition, SpriteManifestEntry };
