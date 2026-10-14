/* @layer renderer-components @kind component */
import { EnhancedPauseView, PauseMenuView } from '../../../hud';
import { usePauseMenuStore } from '../../../stores/pause-menu-store';
import { useGameUIStore } from '../../../stores/game-ui-store';
import { MENU_TRANSITION_MS } from '../GameOverlay.constants';
import type { PauseLayerProps } from '../GameOverlay.type';

const PauseLayer = ({ enhancedRenderable, slide }: PauseLayerProps) => {
  const pauseBrowsing = usePauseMenuStore((s) => s.state.phase === 'browsing');
  const hostMenuHolding = useGameUIStore((s) => s.hostMenu.holding);
  const enhancedMenuOpen = pauseBrowsing && hostMenuHolding;

  if (enhancedRenderable) {
    return (
      <EnhancedPauseView
        slideTransform={enhancedMenuOpen ? 'translateY(0)' : 'translateY(-100%)'}
        slideTransition={`transform ${MENU_TRANSITION_MS}ms linear`}
      />
    );
  }
  return (
    <PauseMenuView
      slideTransform={slide.menuVisible ? 'translateY(0)' : 'translateY(-100%)'}
      slideTransition={slide.transition}
    />
  );
};

export { PauseLayer };
