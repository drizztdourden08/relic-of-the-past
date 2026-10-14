/* @layer renderer-components @kind component */
import { HudLayoutView, HudView } from '../../../hud';
import { HudUnavailableNotice } from '../../HudUnavailableNotice';
import type { MainHudLayerProps } from '../GameOverlay.type';

const MainHudLayer = ({ spriteHudRenderable, enhancedRenderable, slide }: MainHudLayerProps) => {
  if (spriteHudRenderable) {
    return (
      <HudView
        slideTransform={slide.menuVisible ? 'translateY(100%)' : 'translateY(0)'}
        slideTransition={slide.transition}
      />
    );
  }
  return enhancedRenderable ? <HudLayoutView /> : <HudUnavailableNotice />;
};

export { MainHudLayer };
