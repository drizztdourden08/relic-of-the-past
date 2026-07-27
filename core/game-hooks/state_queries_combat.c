/* @layer core-game-hooks @kind native */
#include "game_hooks_internal.h"
#include "src/sprite.h"
#include "src/ancilla.h"

// ─── Combat Table Exports ───
//
// Surfaces the game's own damage-resolution tables so the simulator can predict
// combat outcomes without re-deriving them. Both exports are gated on the
// developer-tools feature flag. Each buffer opens with a STATUS byte: 1 when
// the row that follows was filled, 0 when the gate is off or the query was out
// of range. A zero row is a legitimate answer — a harmless sprite really does
// have no health and no damage entries — so the caller cannot infer "no data"
// from the payload alone and needs to be told outright.

// The parameter is `type_index` rather than a name matching the game's own
// sprite fields: those are macros over the emulated RAM block, so reusing one as
// a local identifier expands mid-declaration and the file will not compile.
//
// Per-sprite-type combat row: status(u8) + health(u8) + initial flags4(u8) +
// damage[16](u8), one resolved byte per damage class. 19 bytes, fixed layout.
static uint8 g_sprite_combat_buf[19];

EMSCRIPTEN_KEEPALIVE
int WasmGetSpriteCombat(int type_index) {
  memset(g_sprite_combat_buf, 0, sizeof(g_sprite_combat_buf));
  if (!(enhanced_features0 & kFeatures0_DeveloperTools))
    return (int)g_sprite_combat_buf;
  if (type_index < 0 || type_index >= 243)
    return (int)g_sprite_combat_buf;

  g_sprite_combat_buf[0] = 1;
  g_sprite_combat_buf[1] = kSpriteInit_Health[type_index];
  g_sprite_combat_buf[2] = kSpriteInit_Flags4[type_index];
  for (int class_id = 0; class_id < 16; class_id++) {
    uint8 bucket = enemy_damage_data[type_index * 16 | class_id];
    g_sprite_combat_buf[3 + class_id] = kEnemyDamages[class_id * 8 | bucket];
  }
  return (int)g_sprite_combat_buf;
}

// Shared combat tables: status(u8), then kAncilla_Damage[57] (ancilla type ->
// damage class), then kAncilla_TileColl0_Attrs[256] (tile attr -> projectile
// collision behavior: 0 pass, 1 block, 2 sloped, 3 layer-dependent, 4 priority
// flip). 314 bytes total, fixed layout.
static uint8 g_combat_tables_buf[1 + 57 + 256];

EMSCRIPTEN_KEEPALIVE
int WasmGetCombatTables(void) {
  memset(g_combat_tables_buf, 0, sizeof(g_combat_tables_buf));
  if (!(enhanced_features0 & kFeatures0_DeveloperTools))
    return (int)g_combat_tables_buf;

  g_combat_tables_buf[0] = 1;
  memcpy(g_combat_tables_buf + 1, kAncilla_Damage, sizeof(kAncilla_Damage));
  memcpy(g_combat_tables_buf + 1 + 57, kAncilla_TileColl0_Attrs, sizeof(kAncilla_TileColl0_Attrs));
  return (int)g_combat_tables_buf;
}
