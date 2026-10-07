/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"

// ─── Hide Space Beyond Walls ───
//
// The space past a room's walls is the ceiling: the Ceiling objects (dungeon.c, subtype 1 index 0
// and its long and diagonal variants) all paint the same tilemap word, and a room's default layout
// and its own objects lay that word everywhere the walls do not enclose. In a house, a cave or the
// sanctuary it is a blank tile in the palette's backdrop colour: the dark brown around the house, the
// dark green around the sanctuary, the dark blue in the frosty caves. The setting paints it pure black.
//
// The PPU does it by identity, not by colour: every frame the hide is on it gets the ceiling block's
// words (PpuSetHiddenTiles), draws a BG2 tile equal to one of them as the gap sentinel, and the
// BlackBackdrop flag renders the sentinel black. The first shape of this feature blacked a colour
// class instead, every BG2 pixel in the last palette, and that palette also holds the sanctuary's
// carpet and a cave's raised floor, both of which it erased. Latching the flag into the standing
// render flags also kept it painting on the overworld, where the same class is tree tops, bushes
// and the ground showing through terrain (issue #179). Now each frame decides for itself: with the
// request off nothing here reads the game, and PpuBeginDrawing resets the flags every frame.
//
// The black is solid. The original 256x224 frame never shows what is past a wall, so the game draws a
// sprite out there with no cover: the player walking out through a doorway, or crossing between two rooms
// of a cave, and anything that flies past a wall. A wider or taller view puts that space on screen. The
// PPU composes sprites first and the backgrounds after them, so where it draws a hidden BG2 tile it lays
// the sentinel over the backdrop and over any sprite pixel already there (PpuPaintGap). BG1 keeps its pixels, and
// BG3 is drawn later with a higher priority than the sentinel, so the HUD and the message box stay on top.
// It follows the same per-frame answer as the fill, with no state of its own.
//
// Yes means the frame shows a room. player_is_indoors is that exactly: Dungeon_LoadEntrance sets it
// inside the force-blank frame that swaps the overworld for the room, and LoadOverworldFromDungeon
// clears it inside the one that swaps the room back out. The module cannot say it: leaving a room
// runs the iris close under MODULE_SPOTLIGHT_CLOSE while the room is still on screen, so a module
// test dropped the black band for the whole fade. The byte is left standing on the file-select and
// attract screens after a quit or a death, which is what the module range below excludes.
//
// Palaces are left alone, all but the one room at the end of this comment: a room whose floor sits on
// a translucent layer over the ceiling word would lose it. The game marks every room outside a palace with palace index 0xff. The sanctuary is the
// one room the game files under a palace (the sewers) that plays as a house, so it is named by room id.
//
// The palace index is a proxy for that, and a handful of rooms slip past it: the game hands their
// entrance palace index 0xff while the room itself is drawn with a dungeon's art. Room 0x10B is one,
// and there the fill blacks the void on three sides and leaves the water channel standing down the
// fourth, because the channel is real art on the same layer as the ceiling word. What a room is drawn
// with is the property that separates the two sides, and the room header states it: byte 2 is the
// tileset. Across all 320 rooms they share none of them. Houses, shops and caves draw with 3, 6, 15,
// 16, 17, 18 and 20; every room a palace entrance leads to draws with 0, 1, 2, 4, 5, 7, 8, 9, 10, 11,
// 12, 13 or 14, and the tower and pyramid rooms with 19. Rooms 0x10B and 0x10D borrow the flooded
// palace's 8, and room 0x119 borrows 10, which is why the three of them lose the fill here.
//
// The sanctuary is the single covered room drawn with a dungeon's tileset (4, which it shares with a
// sewer room), so it stays named by room id and answers before the tileset does.
//
// One palace room is covered, named by room id: the tower room of the Agahnim fight. Its surround is
// not the ceiling word. It is a solid tile in colour 15 of BG palette 6 (word 0x18c9, which also fills
// all of BG1), plus colour 7 of BG palette 7 in the solid tile 0x1d99 and in the outer half of the
// diagonal rail tiles. Both entries hold the same bright blue, and no other tile in
// the room draws either of them. Tile identity cannot reach the rail tiles, which are part rail and
// part surround, so this room is hidden by colour entry: the two CGRAM entries are black while the frame
// draws and get their values back when it ends (GameHook_HideSpaceBeyondWallsDone), so a save state and
// the game never see the change. The game's screen flash rewrites those entries every frame and the
// next draw blacks them again, so the surround stays black through it.
static bool g_wanted_hide_space_beyond_walls;

void GameHook_SetHideSpaceBeyondWalls(bool enable) {
  g_wanted_hide_space_beyond_walls = enable;
}

// Whether the room draws the space past its walls as an empty surround, from the tileset its header
// names. Read from the table and not from the live copy (aux_tile_theme_index), which the map screen
// and the mirror warp borrow for their own art while a room is still loaded.
// Tilesets 15 and 16 are left out. Only Sahasrahla's hideout (room 0x105) and the East Dark World
// building with the talking tree (room 0x11A) draw with 15, and only the King's Tomb (room 0x113)
// with 16, beside a castle room a palace already owns. All three are built like a palace room with
// green stone walls, and the space past those walls is part of how they look.
static bool RoomDrawsEmptySurround(void) {
  unsigned room = (unsigned)dungeon_room_index;
  if (room >= kDungeonRoomHeadersOffs_SIZE / 2) return false;
  switch (GetRoomHeaderPtr((int)room)[2]) {
    case 3:   // the village and lake houses, and the shops
    case 6:   // the caves
    case 17: case 18: case 20:  // the smaller house and cave sets
      return true;
    default:
      return false;
  }
}

// The request is on and the frame shows a room.
static bool FrameShowsRoom(void) {
  if (!g_wanted_hide_space_beyond_walls || !player_is_indoors) return false;
  int mod = main_module_index;
  if (mod == MODULE_MENU) mod = saved_module_for_menu;
  return mod >= MODULE_PRE_DUNGEON && mod < MODULE_TRIFORCE_ROOM && mod != MODULE_ATTRACT;
}

static bool HideActive(void) {
  if (!FrameShowsRoom()) return false;
  if (dungeon_room_index == ROOM_SANCTUARY) return true;
  if ((uint8)cur_palace_index_x2 != 0xff) return false;
  return RoomDrawsEmptySurround();
}

// The CGRAM entries that colour the surround of ROOM_TOWER_AGAHNIM: BG palette 6 colour 15 and BG
// palette 7 colour 7. While a frame of that room draws they hold black, and these keep their values.
static const uint8 kSurroundColourEntries[2] = {6 * 16 + 15, 7 * 16 + 7};
static uint16 g_surround_colour_saved[2];
static bool g_surround_colours_black;

static void BlackenSurroundColours(void) {
  if (g_surround_colours_black) return;
  for (int i = 0; i < 2; i++) {
    g_surround_colour_saved[i] = g_zenv.ppu->cgram[kSurroundColourEntries[i]];
    g_zenv.ppu->cgram[kSurroundColourEntries[i]] = 0;
  }
  g_surround_colours_black = true;
}

int GameHook_HideSpaceBeyondWallsFill(const uint16 **words) {
  if (FrameShowsRoom() && dungeon_room_index == ROOM_TOWER_AGAHNIM) BlackenSurroundColours();
  if (!HideActive()) return 0;
  *words = Dungeon_CeilingTileWords();
  return kCeilingBlockWords;
}

void GameHook_HideSpaceBeyondWallsDone(void) {
  if (!g_surround_colours_black) return;
  for (int i = 0; i < 2; i++) g_zenv.ppu->cgram[kSurroundColourEntries[i]] = g_surround_colour_saved[i];
  g_surround_colours_black = false;
}

// Headless probe: what this frame would hand the PPU. [0] = word count (0 when nothing is hidden),
// [1..4] = the ceiling words, [5] = 1 when the frame blacks the surround colour entries instead. Gated
// on the developer-tools bit like the frame dump; off, 0 and nothing written. The renderer never calls this.
static uint16 g_hide_probe[2 + kCeilingBlockWords];

EMSCRIPTEN_KEEPALIVE
int WasmDevHideSpaceFill(void) {
  if (!(enhanced_features0 & kFeatures0_DeveloperTools)) return 0;
  const uint16 *words = NULL;
  int n = GameHook_HideSpaceBeyondWallsFill(&words);
  g_hide_probe[0] = (uint16)n;
  for (int i = 0; i < kCeilingBlockWords; i++) g_hide_probe[1 + i] = (i < n) ? words[i] : 0;
  g_hide_probe[1 + kCeilingBlockWords] = g_surround_colours_black ? 1 : 0;
  GameHook_HideSpaceBeyondWallsDone();
  return (int)(uintptr_t)g_hide_probe;
}
