/* @layer shared-game @kind types */
import type { ScreenId } from '../../../data';
import type { GameScreenId } from '../game-id';

type ScreenRef =
  | { kind: 'id'; id: string }
  | { kind: 'game'; gameId: GameScreenId; world?: 'light' | 'dark' };

interface ScreenDescription {
  name: string | null;
  id: ScreenId | null;
  hexLabel: string;
  label: string;
}

export type { ScreenDescription, ScreenRef };
