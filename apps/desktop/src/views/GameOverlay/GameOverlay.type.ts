/* @layer renderer-components @kind types */
interface GameOverlayProps {
  width: number;
  height: number;
  profileId?: string;
}

type MenuPhase = 'gameplay' | 'opening' | 'open' | 'closing';

interface MenuSlide {
  menuVisible: boolean;
  transition: string;
}

interface HudRenderable {
  gameMode: string;
  enhancedHudMode: boolean;
  spriteHudRenderable: boolean;
  enhancedRenderable: boolean;
  showMainSlot: boolean;
  showPauseMenu: boolean;
}

interface PauseLayerProps {
  enhancedRenderable: boolean;
  slide: MenuSlide;
}

interface MainHudLayerProps {
  spriteHudRenderable: boolean;
  enhancedRenderable: boolean;
  slide: MenuSlide;
}

export type { GameOverlayProps, HudRenderable, MainHudLayerProps, MenuPhase, MenuSlide, PauseLayerProps };
