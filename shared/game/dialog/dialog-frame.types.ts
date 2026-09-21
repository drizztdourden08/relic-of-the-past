/* @layer shared-game @kind types */
/**
 * What the text engine has on screen, as the host's message box needs it. Built from the
 * core's dialog mirror snapshot (core/game-hooks/dialog_mirror.c), one frame at a time.
 */

/** One drawn glyph: its id in the language's alphabet, pen x and width in text-area pixels. */
interface DialogCell {
  glyph: number;
  x: number;
  w: number;
}

/** What the engine is parked on, if anything. */
type DialogWait = 'none' | 'timed' | 'key' | 'end' | 'choice' | 'item';

/**
 * Bordered box, [Window 02] floating text (telepathy and story lines), the attract-mode story
 * crawl, or the death and select menus that run through the same engine without a border.
 */
type DialogKind = 'box' | 'floating' | 'story' | 'menu';

interface DialogFrame {
  active: boolean;
  kind: DialogKind;
  /** BG3 tilemap word address the core chose for the frame's top-left tile. */
  topleft: number;
  /** The three visible rows, in draw order. */
  rows: DialogCell[][];
  /** Pixels a [Scroll] has shifted the rows up so far, 0..15. */
  scrollStep: number;
  wait: DialogWait;
  choice: number;
  messageId: number;
  /** The engine's kText_Render state, 0..4. */
  renderState: number;
  /**
   * Whether the core is withholding the native box for this message. Decided once as the message
   * opens and held for its life (core/game-hooks/dialog_suppress.c), so the host box draws only
   * where the native one is actually standing down and the two can never both be up.
   */
  nativeHidden: boolean;
  /** Messages started since boot, modulo 256; a loaded state does not advance it. */
  generation: number;
  /** The text layer's live scroll in game pixels, as the renderer draws it (the story crawl moves its words this way). */
  layerScrollX: number;
  layerScrollY: number;
  /** The whole message's widest row in text-area pixels, measured when it loaded; 0 when unknown. */
  messageWidth: number;
  /** The most rows any screen of the message shows, 1..3; 0 when unknown. */
  messageRows: number;
}

export type { DialogCell, DialogFrame, DialogKind, DialogWait };
