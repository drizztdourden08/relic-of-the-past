/* @layer shared-game @kind types */
type BorderDir = 'n' | 's' | 'e' | 'w';

interface BorderBundle {
  id: string;
  direction: BorderDir;
  tiles: number[];
  requirements: string[][];
}

interface WalkConnection {
  fromBundle: BorderBundle;
  toBundle: BorderBundle;
  overlapTiles: number[];
}

export type { BorderBundle, BorderDir, WalkConnection };
