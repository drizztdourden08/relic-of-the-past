/* @layer renderer-hud @kind component */
/**
 * The enhanced message box. Reads the core's dialog mirror through the dialog store and the look
 * from the dialog settings store, and draws the frame and rows over the canvas in either HUD mode.
 * Skipped messages never show: with skip-dialog on, only a box that waits on a choice is drawn.
 * Nothing is drawn for a message the core is still drawing itself, which is how a setting changed
 * mid-message lands: that message stays native and the next one is ours (dialog_suppress.c).
 * After a save-state load the store is stale until the next message, and nothing is drawn. The box
 * fades in when a message starts and fades out on its last content when it closes.
 */
import { useMemo, useRef } from 'react';
import { useDialogStore } from '../../../../../stores/dialog-store';
import { useDialogSettingsStore } from '../../../../../stores/dialog-settings-store';
import { useGameUIStore } from '../../../../../stores/game-ui-store';
import { getSpritesBase } from '@shared/game/logic/queries/item-sprites';
import { getGlyphAtlas } from '../../../../../lib/game/dialog/glyph-atlas';
import { activeAlphabet } from '../../../../../lib/game/dialog/active-alphabet';
import { HudBox } from '../../primitives/HudBox';
import { DialogBox } from '../../compounds/DialogBox';
import { DialogRows } from '../../compounds/DialogRows';
import { DialogPrompts } from '../../compounds/DialogPrompts';
import { promptsFor } from '@shared/game/dialog/dialog-prompts';
import { getSlotSprite } from '../../composites/PauseItemSlot';
import { TILE_PX } from '@shared/game/dialog/box-geometry';
import { strokeWidthsOf } from '@shared/game/dialog/box-style';
import { useDialogScale } from './behavior/useDialogScale';

/** The legend told over the pictures, the story crawl's first part (attract.c loads it by this id). */
const STORY_LEGEND_MESSAGE = 0x112;
/** The spawn picker on starting a game or continuing after death, without and with the mountain spawn (misc.c). */
const SPAWN_PICKER_MESSAGES = new Set([0x184, 0x185]);
/** Zelda's telepathy in the opening at Link's house, her call while Link is still in bed (the uncle raises it). */
const INTRO_TELEPATHY_MESSAGES = new Set([0x1f]);
import { useDialogGeometry } from './behavior/useDialogGeometry';
import { useFadePresence } from './behavior/useFadePresence';
import { useButtonGlyphs } from './behavior/useButtonGlyphs';
import { useChoiceLatch } from './behavior/useChoiceLatch';
import { useOpeningMessage } from './behavior/useOpeningMessage';

const DialogView = () => {
  const liveFrame = useDialogStore((s) => s.frame);
  const stale = useDialogStore((s) => s.stale);
  const look = useDialogSettingsStore();
  const { font, fontScale, inkColor, strokeColor, strokeWidth, boxFit, autoSkipDialog } = look;
  const items = useGameUIStore((s) => s.inventory.items);
  const { containerRef, ...metrics } = useDialogScale();
  const { glyphsFor } = useButtonGlyphs();

  const liveWait = useChoiceLatch(liveFrame);
  const waitsOnPlayerChoice = liveWait === 'choice' || liveWait === 'item';
  const show = liveFrame.active && liveFrame.nativeHidden && !stale && (!autoSkipDialog || waitsOnPlayerChoice);
  const fade = useFadePresence(show);

  // A closed box fades out on what it last showed, so the last shown frame is kept while it fades.
  const lastShownRef = useRef(liveFrame);
  if (show) lastShownRef.current = { ...liveFrame, wait: liveWait };
  const frame = lastShownRef.current;
  const openingMessage = useOpeningMessage(frame);
  // The spawn picker always floats on a faded ground, whatever border the player chose.
  const spawnPicker = frame.kind === 'box' && SPAWN_PICKER_MESSAGES.has(openingMessage);
  const borderKind = spawnPicker ? 'none' : look.border;

  // A drawn border and its corner marks take room the game's one-tile inset never had to give.
  const widths = strokeWidthsOf(look.borderThickness);
  const ring = borderKind === 'single' ? widths.outer : borderKind === 'double' ? widths.outer + widths.inner + widths.gap : 0;
  // The game's box keeps its one-tile inset. A drawn border needs a little side air past its ring, more
  // with corner marks so the rows clear them, and only a sliver above and below.
  const drawn = borderKind === 'single' || borderKind === 'double';
  const styled = frame.kind === 'box' && borderKind !== 'original';
  const padX = styled ? ring + (look.cornerMark !== 'none' && drawn ? 11 : 6) : TILE_PX;
  const padY = styled ? ring + 2 : TILE_PX;
  // Screens the game lays out around their words keep the game's text position and size: the game-over
  // menu (the fairy points at each row) and the story crawl (placed over its scene, moved by layer scroll).
  const native = frame.kind === 'menu' || frame.kind === 'story';
  const geometry = useDialogGeometry(frame, {
    mode: native ? 'native' : boxFit, fontScale: native ? 1 : fontScale, padX, padY,
    shiftX: native ? frame.layerScrollX : 0, shiftY: native ? frame.layerScrollY : 0,
  }, metrics);
  // A talk box always has a ground. The legend told over the pictures and the game-over menu never do;
  // the later story scenes do, always faded at the edges. A borderless message such as telepathy follows
  // its setting, with the opening telepathy at Link's house on a setting of its own.
  const floatingGround = INTRO_TELEPATHY_MESSAGES.has(openingMessage) ? look.introTelepathyGround : look.floatingGround;
  const sceneGround = frame.kind === 'story' && frame.messageId !== STORY_LEGEND_MESSAGE;
  const grounded = frame.kind === 'box' || sceneGround || (frame.kind === 'floating' && floatingGround);
  const feathered = sceneGround || spawnPicker || look.groundFade;
  // The atlas is cached per font and palette; asking per message catches a language switch or a [Color] line.
  const atlas = useMemo(() => (frame.active ? getGlyphAtlas() : null), [frame.active, frame.messageId, frame.generation]);
  const alphabet = useMemo(() => (frame.active ? activeAlphabet() : []), [frame.active]);
  const spritesBase = getSpritesBase();
  const prompts = look.buttonPrompts
    ? promptsFor(frame, look.prompts).map((p) => ({ glyphs: glyphsFor(p.buttons), label: p.label, hold: p.hold }))
    : [];
  const itemSprite = frame.wait === 'item' && frame.choice < items.length
    ? getSlotSprite(frame.choice, items[frame.choice])
    : null;

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
