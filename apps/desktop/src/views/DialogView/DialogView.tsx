/* @layer renderer-hud @kind component */
import { useMemo, useRef } from 'react';
import { useDialogStore } from '../../stores/dialog-store';
import { useDialogSettingsStore } from '../../stores/dialog-settings-store';
import { useGameUIStore } from '../../stores/game-ui-store';
import { getSpritesBase } from '@rotp/game-data';
import { getGlyphAtlas } from '@rotp/game-core';
import { activeAlphabet } from '@rotp/game-core';
import { HudBox } from '../../primitives/HudBox';
import { DialogBox } from '../../compounds/DialogBox';
import { DialogRows } from '../../compounds/DialogRows';
import { DialogPrompts } from '../../compounds/DialogPrompts';
import { promptsFor } from '@rotp/game-data';
import { TILE_PX } from '@rotp/game-data';
import { strokeWidthsOf } from '@rotp/game-data';
import { useDialogScale } from './behavior/useDialogScale';
import { INTRO_TELEPATHY_MESSAGES, SPAWN_PICKER_MESSAGES, STORY_LEGEND_MESSAGE } from './DialogView.constants';
import { useDialogGeometry } from './behavior/useDialogGeometry';
import { useFadePresence } from './behavior/useFadePresence';
import { useButtonGlyphs } from './behavior/useButtonGlyphs';
import { useChoiceLatch } from './behavior/useChoiceLatch';
import { useOpeningMessage } from './behavior/useOpeningMessage';
import { pickerItemSprite } from './behavior/picker-item-sprite';
import { useHighlightLook } from './behavior/useHighlightLook';

const DialogView = () => {
  const liveFrame = useDialogStore((s) => s.frame);
  const stale = useDialogStore((s) => s.stale);
  const look = useDialogSettingsStore();
  const { font, fontScale, inkColor, strokeColor, strokeWidth, boxFit, autoSkipDialog } = look;
  const inventory = useGameUIStore((s) => s.inventory);
  const equipment = useGameUIStore((s) => s.equipment);
  const { containerRef, ...metrics } = useDialogScale();
  const { glyphsFor } = useButtonGlyphs();

  const liveWait = useChoiceLatch(liveFrame);
  const waitsOnPlayerChoice = liveWait === 'choice' || liveWait === 'item';
  const show = liveFrame.active && liveFrame.nativeHidden && !stale && (!autoSkipDialog || waitsOnPlayerChoice);
  const fade = useFadePresence(show);

  const lastShownRef = useRef(liveFrame);
  if (show) lastShownRef.current = { ...liveFrame, wait: liveWait };
  const frame = lastShownRef.current;
  const openingMessage = useOpeningMessage(frame);
  const spawnPicker = frame.kind === 'box' && SPAWN_PICKER_MESSAGES.has(openingMessage);
  const borderKind = spawnPicker ? 'none' : look.border;

  const widths = strokeWidthsOf(look.borderThickness);
  const ring = borderKind === 'single' ? widths.outer : borderKind === 'double' ? widths.outer + widths.inner + widths.gap : 0;
  const drawn = borderKind === 'single' || borderKind === 'double';
  const styled = frame.kind === 'box' && borderKind !== 'original';
  const padX = styled ? ring + (look.cornerMark !== 'none' && drawn ? 11 : 6) : TILE_PX;
  const padY = styled ? ring + 2 : TILE_PX;
  const native = frame.kind === 'menu' || frame.kind === 'story';
  const geometry = useDialogGeometry(frame, {
    mode: native ? 'native' : boxFit, fontScale: native ? 1 : fontScale, padX, padY,
    shiftX: native ? frame.layerScrollX : 0, shiftY: native ? frame.layerScrollY : 0,
  }, metrics);
  const floatingGround = INTRO_TELEPATHY_MESSAGES.has(openingMessage) ? look.introTelepathyGround : look.floatingGround;
  const sceneGround = frame.kind === 'story' && frame.messageId !== STORY_LEGEND_MESSAGE;
  const grounded = frame.kind === 'box' || sceneGround || (frame.kind === 'floating' && floatingGround);
  const feathered = sceneGround || spawnPicker || look.groundFade;
  const atlas = useMemo(() => (frame.active ? getGlyphAtlas() : null), [frame.active, frame.messageId, frame.generation]);
  const alphabet = useMemo(() => (frame.active ? activeAlphabet() : []), [frame.active]);
  const highlight = useHighlightLook({ frame, primary: look.highlightPrimary, secondary: look.highlightSecondary });
  const spritesBase = getSpritesBase();
  const prompts = look.buttonPrompts
    ? promptsFor(frame, look.prompts).map((p) => ({ glyphs: glyphsFor(p.buttons), label: p.label, hold: p.hold }))
    : [];
  const itemSprite = frame.wait === 'item' ? pickerItemSprite(frame.choice, inventory, equipment) : null;

  return (
    <HudBox ref={containerRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {fade.mounted && (
        <HudBox style={{ position: 'absolute', inset: 0, opacity: fade.opacity, transition: fade.transition }}>
          <DialogBox
            rect={geometry.frame} bordered={frame.kind === 'box'} tile={geometry.tile} spritesBase={spritesBase} feathered={feathered}
            ground={{ color: look.groundColor, opacity: grounded ? look.boxOpacity : 0 }}
            border={{ kind: borderKind, thickness: look.borderThickness, color: look.borderTint, corner: look.corner, mark: look.cornerMark, markAngle: look.cornerMarkAngle }}
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
