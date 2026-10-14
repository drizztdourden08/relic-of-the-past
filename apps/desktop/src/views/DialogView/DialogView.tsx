/* @layer renderer-hud @kind component */
import { useDialogSettingsStore } from '../../stores/dialog-settings-store';
import { HudBox } from '../../primitives/HudBox';
import { DialogBox } from '../../compounds/DialogBox';
import { DialogRows } from '../../compounds/DialogRows';
import { DialogPrompts } from '../../compounds/DialogPrompts';
import { useDialogScale } from './behavior/useDialogScale';
import { useDialogGeometry } from './behavior/useDialogGeometry';
import { useShownFrame } from './behavior/useShownFrame';
import { useDialogChrome } from './behavior/useDialogChrome';
import { useDialogContent } from './behavior/useDialogContent';
import { groundingOf } from './behavior/grounding-of';
import { geometryOptionsOf } from './behavior/geometry-options';

const DialogView = () => {
  const look = useDialogSettingsStore();
  const { font, inkColor, strokeColor, strokeWidth } = look;
  const { containerRef, ...metrics } = useDialogScale();
  const { frame, fade } = useShownFrame(look.autoSkipDialog);
  const chrome = useDialogChrome(frame, look);
  const geometry = useDialogGeometry(frame, geometryOptionsOf(frame, look, chrome), metrics);
  const { grounded, feathered } = groundingOf(frame, look, chrome);
  const { atlas, alphabet, highlight, spritesBase, prompts, itemSprite } = useDialogContent(frame, look);

  return (
    <HudBox ref={containerRef} layout="overlay">
      {fade.mounted && (
        <HudBox style={{ position: 'absolute', inset: 0, opacity: fade.opacity, transition: fade.transition }}>
          <DialogBox
            rect={geometry.frame} bordered={frame.kind === 'box'} tile={geometry.tile} spritesBase={spritesBase} feathered={feathered}
            ground={{ color: look.groundColor, opacity: grounded ? look.boxOpacity : 0 }}
            border={{ kind: chrome.borderKind, thickness: look.borderThickness, color: look.borderTint, corner: look.corner, mark: look.cornerMark, markAngle: look.cornerMarkAngle }}
            texture={{ texture: grounded ? look.texture : 'none', color: look.textureColor, opacity: look.textureOpacity, animation: look.textureAnimation, speed: look.textureSpeed, scale: look.textureScale, density: look.textureDensity, scatter: look.textureScatter }}
          >
            <HudBox style={{ position: 'absolute', left: geometry.textOrigin.x, top: geometry.textOrigin.y }}>
              <DialogRows
                rows={frame.rows}
                unit={geometry.unit}
                widthPx={geometry.textWidthPx}
                visibleRows={geometry.visibleRows}
                scrollStep={frame.scrollStep}
                font={font}
                atlas={atlas?.canvas ?? null}
                highlight={highlight}
                alphabet={alphabet}
                ink={inkColor}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                itemSprite={itemSprite ? `${spritesBase}${itemSprite}.png` : null}
              />
            </HudBox>
          </DialogBox>
          <DialogPrompts
            prompts={prompts} box={geometry.frame} limit={metrics.height} scale={metrics.scale}
            ink={inkColor} stroke={strokeColor}
          />
        </HudBox>
      )}
    </HudBox>
  );
};

export { DialogView };
