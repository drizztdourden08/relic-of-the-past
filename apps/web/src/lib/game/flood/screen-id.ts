/* @layer bridge-wasm @kind logic */
/**
 * The canonical screen id for an OVERWORLD screen index — `lw-2c` / `dw-2c`.
 *
 * Overworld only, on purpose. An indoor screen id is not derivable from the room
 * number (they are keyed by `palaceIndex:roomIndex` and look like `hc-0x80`), so a
 * synthesized `room-080` matches nothing in SCREEN_BY_ID — which silently cost the
 * widget every indoor exit. Indoor callers must use the DETECTED screen's own id.
 */
const overworldScreenId = (screenIndex: number, isDarkWorld = false): string =>
  `${isDarkWorld ? 'dw' : 'lw'}-${screenIndex.toString(16).padStart(2, '0')}`;

export { overworldScreenId };
