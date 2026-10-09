/* @layer renderer-components @kind types */
interface GameOverlayProps {
  width: number;
  height: number;
  profileId?: string;
}

type MenuPhase = 'gameplay' | 'opening' | 'open' | 'closing';

export type { GameOverlayProps, MenuPhase };
