#pragma once
#include "types.h"
#include "variables.h"


typedef struct PrepOamCoordsRet {
  uint16 x, y;
  uint8 r4;
  uint8 flags;
} PrepOamCoordsRet;

typedef struct SpriteHitBox {
  uint8 r0_xlo;
  uint8 r8_xhi;
  uint8 r1_ylo;
  uint8 r9_yhi;
  uint8 r2, r3;

  uint8 r4_spr_xlo;
  uint8 r10_spr_xhi;

  uint8 r5_spr_ylo;
  uint8 r11_spr_yhi;
  uint8 r6_spr_xsize;
  uint8 r7_spr_ysize;
} SpriteHitBox;

typedef struct SpriteSpawnInfo {
  uint16 r0_x;
  uint16 r2_y;
  uint8 r4_z;
  uint16 r5_overlord_x;
  uint16 r7_overlord_y;
} SpriteSpawnInfo;

extern const uint8 kAbsorbBigKey[2];

typedef struct DrawMultipleData {
  int8 x, y;
  uint16 char_flags;
  uint8 ext;
} DrawMultipleData;


enum {
  kCheckDamageFromPlayer_Carry = 1,
  kCheckDamageFromPlayer_Ne = 2,
};

// Tall screens: OAM Y is only 8-bit. When a tall view is configured (g_oam_tall_budget != 0) encode a
// 9-bit screen-Y — low 8 bits in oam->y, the rest in g_oam_y_high[slot] — so the PPU can place sprites
// across the taller-than-256px pan (mirror of the stock 9-bit X). Outside the representable range, hide
// (0xf0). Non-tall keeps the exact stock 8-bit clip (screen-Y in [-16, 239]).
//
// g_oam_y_high is a THREE-state marker, not a bare bit: kOamY_Stock means no tall-aware writer touched
// this slot this frame, so the PPU reads the entry the vanilla way. That distinction is load-bearing.
// The hardware's hide value is a Y of 0xf0, and on a 224-row screen no visible row can produce that byte
// — but a tall view renders rows 240 and -16, whose 9-bit encodings BOTH have 0xf0 as their low byte. With
// only a bit to go on, the PPU cannot tell those two real rows from a hidden sprite and blanks the entry
// for exactly the frames it sits there: every sprite crossing either row blinks out, once per crossing,
// which reads as a flicker while the view pans. The marker says "this Y is a tall-encoded coordinate",
// making the sentinel unambiguous again.
enum {
  kOamY_Stock = 0,  // untouched this frame: vanilla 8-bit Y, 0xf0 means hidden
  kOamY_Low   = 1,  // tall-encoded, 9th bit clear
  kOamY_High  = 2,  // tall-encoded, 9th bit set
};

static inline void OamSetY(OamEnt *oam, uint16 y) {
  if (g_oam_tall_budget) {
    int16 ys = (int16)y;
    int b = (int)g_oam_tall_budget;
    if (ys >= b - 256 && ys < 256 + b) {
      oam->y = (uint8)y;
      g_oam_y_high[oam - oam_buf] = ((y >> 8) & 1) ? kOamY_High : kOamY_Low;
    } else {
      oam->y = 0xf0;
      // Clear it: the OAM region allocator recycles slots within a frame, so a marker left by an earlier
      // sprite would make this hidden entry read as a tall coordinate (the Y-axis twin of W-14).
      g_oam_y_high[oam - oam_buf] = kOamY_Stock;
    }
  } else {
    oam->y = (uint16)(y + 0x10) < 0x100 ? (uint8)y : 0xf0;
  }
}

// Mirror of OamSetX for draw routines that keep only the LOW BYTE of a sprite's world X (per-segment
// position histories, for instance). Such a caller cannot produce a true absolute screen X, so it must
// NOT drive the wide-view high-X extension: the stock 9-bit X is the whole coordinate, exactly as
// SetOamPlain treats it. Handing the low-byte difference to OamSetX instead derives a garbage
// (int16)x >> 9 and flings the sprite a multiple of 512px off-screen.
static inline void OamSetXLowByte(OamEnt *oam, uint8 x) {
  oam->x = x;
  g_oam_x_high[oam - oam_buf] = 0;
}

// Some draw routines keep only the low byte of a sprite's world Y (per-segment position histories, for
// instance) and rely on 8-bit wrap to place anything above the camera: a screen-Y of -8 arrives as 0xf8.
// OamSetY needs a SIGNED screen-Y to build the 9-bit form a tall view reads, so map that wrap band back
// to negative first. 0xf0..0xff is the stock visible-above-top window ([-16,-1]); 0xe0..0xef really is
// below a 224-line screen, so it must stay positive.
static inline uint16 OamWrappedScreenY(int y) {
  uint8 v = (uint8)y;
  return (uint16)(v >= 0xf0 ? (int)v - 256 : (int)v);
}

// The Y counterpart of OamSetXLowByte, for the helpers that only ever receive a low-byte screen Y. Such a
// caller cannot say WHICH band it means: on a tall screen the byte 0xf8 is row -8 in the top band and row
// 248 in the bottom one, both rendered, and nothing in the byte separates them. So store it raw and let the
// PPU read it the vanilla way, and clear the marker — the OAM region allocator recycles slots within a
// frame, and a marker left by an earlier sprite would make this raw byte read as a tall coordinate (the
// Y-axis twin of W-14).
static inline void OamSetYRaw(OamEnt *oam, uint8 y) {
  oam->y = y;
  if (g_oam_tall_budget)
    g_oam_y_high[oam - oam_buf] = kOamY_Stock;
}

// For the draw routines that write oam->y directly from an expression built on the FULL signed screen Y
// (info.y and friends) and lose the sign to the 8-bit store. Vanilla could afford that: the PPU's row test
// wraps mod 256, and on a 224-row screen only one of the two aliases is ever on screen, so a sprite above
// the camera resolved correctly. A tall view renders 320 rows, where BOTH aliases can be visible, and the
// truncated value draws an off-screen-above sprite down in the play area instead. The value is right there
// at these call sites, so keep it. Off, this is the same byte the vanilla store wrote.
static inline void OamSetYFull(OamEnt *oam, uint16 y) {
  if (g_oam_tall_budget)
    OamSetY(oam, y);
  else
    oam->y = (uint8)y;
}

// Wide screens: the stock OAM X is 9-bit (oam->x + the high bit in bytewise_extended_oam below), which
// caps the view at 512px. When a wide view is configured (g_oam_wide_budget != 0) also carry the SIGNED X
// bits ABOVE the 9th in g_oam_x_high[slot] = (int16)x >> 9, so the PPU can place the sprite at its true
// absolute X. 0 for any sprite in [-512,511], so this only matters for the far side of a >512px view.
static inline void OamSetX(OamEnt *oam, uint16 x) {
  oam->x = x;
  if (g_oam_wide_budget)
    g_oam_x_high[oam - oam_buf] = (uint8)((int16)x >> 9);
}

static inline void SetOamHelper0(OamEnt *oam, uint16 x, uint16 y, uint8 charnum, uint8 flags, uint8 big) {
  OamSetX(oam, x);
  OamSetY(oam, y);
  oam->charnum = charnum;
  oam->flags = flags;
  bytewise_extended_oam[oam - oam_buf] = big | (x >> 8 & 1);
}

static inline void SetOamHelper1(OamEnt *oam, uint16 x, uint8 y, uint8 charnum, uint8 flags, uint8 big) {
  OamSetX(oam, x);
  OamSetYRaw(oam, y);
  oam->charnum = charnum;
  oam->flags = flags;
  bytewise_extended_oam[oam - oam_buf] = big | (x >> 8 & 1);
}

// W-14: this never cleared g_oam_x_high on slot reuse, so the OAM region allocator (Oam_GetBufferPosition)
// recycling a slot within a frame after OamSetX set a high bit for an earlier (wide) sprite would draw
// THIS sprite ~512px off-screen. Gated: only touch g_oam_x_high when a wide view is actually configured,
// so the vanilla path stays byte-identical. The uint8 x parameter deliberately stays 8-bit; see
// OamSetXLowByte above; 94 call sites pass genuine low-byte values, and widening it here would derive
// garbage high bits for every one of them.
static inline void SetOamPlain(OamEnt *oam, uint8 x, uint8 y, uint8 charnum, uint8 flags, uint8 big) {
  oam->x = x;
  OamSetYRaw(oam, y);
  oam->charnum = charnum;
  oam->flags = flags;
  bytewise_extended_oam[oam - oam_buf] = big;
  if (Wide_Active())
    g_oam_x_high[oam - oam_buf] = 0;
}

// Wraps SetOamPlain for the garnish draw handlers (W-01), which call SetOamPlain directly today and so
// truncate screen X to 8 bits. Off, this is exactly SetOamPlain. On, it routes X through the same 9-bit /
// high-X path OamSetX already gives every other OAM helper, while keeping Y/charnum/flags/ext semantics
// identical to what SetOamPlain produces for an in-range X. Not called from anywhere yet; the call sites
// are fixed per-handler elsewhere.
static inline void Garnish_SetOam(OamEnt *oam, uint16 x, uint16 y, uint8 ch, uint8 flags, uint8 big) {
  if (!Wide_Active()) {
    SetOamPlain(oam, (uint8)x, (uint8)y, ch, flags, big);
    return;
  }
  OamSetX(oam, x);
  oam->y = (uint8)y;
  oam->charnum = ch;
  oam->flags = flags;
  bytewise_extended_oam[oam - oam_buf] = big | (x >> 8 & 1);
}



extern const uint8 kAbsorptionSfx[15];
extern const uint8 kSpriteInit_BumpDamage[243];
extern const uint16 kSinusLookupTable[256];
extern const uint8 kThrowableScenery_Flags[9];
extern const uint8 kWishPond2_OamFlags[76];
extern const uint8 kEnemyDamages[128];
extern const uint8 kSpriteInit_Health[243];
extern const uint8 kSpriteInit_Flags4[243];

uint16 Sprite_GetX(int k);
uint16 Sprite_GetY(int k);
void Sprite_SetX(int k, uint16 x);
void Sprite_SetY(int k, uint16 y);
void Sprite_ApproachTargetSpeed(int k, uint8 x, uint8 y);
void SpriteAddXY(int k, int xv, int yv);
void Sprite_MoveXYZ(int k);
void Sprite_Invert_XY_Speeds(int k);
int Sprite_SpawnSimpleSparkleGarnishEx(int k, uint16 x, uint16 y, int limit);
uint16 Garnish_GetX(int k);
uint16 Garnish_GetY(int k);
void Garnish_SparkleCommon(int k, uint8 shift);
void Garnish_DustCommon(int k, uint8 shift);
void SpriteModule_Explode(int k);
void SpriteDeath_MainEx(int k, bool second_entry);
void SpriteModule_Burn(int k);
void Sprite_HitTimer31(int k);
void SpriteStunned_MainEx(int k, bool second_entry);
int Ancilla_SpawnFallingPrize(uint8 item);
bool Sprite_CheckDamageToAndFromLink(int k);
uint8 Sprite_CheckTileCollision(int k);
bool Sprite_TrackBodyToHead(int k);
void Sprite_DrawMultiple(int k, const DrawMultipleData *src, int n, PrepOamCoordsRet *info);
void Sprite_DrawMultiplePlayerDeferred(int k, const DrawMultipleData *src, int n, PrepOamCoordsRet *info);
int Sprite_ShowSolicitedMessage(int k, uint16 msg);
int Sprite_ShowMessageOnContact(int k, uint16 msg);
void Sprite_ShowMessageUnconditional(uint16 msg);
bool Sprite_TutorialGuard_ShowMessageOnContact(int k, uint16 msg);
void Sprite_ShowMessageMinimal();
void Prepare_ApplyRumbleToSprites();
void Sprite_SpawnImmediatelySmashedTerrain(uint8 what, uint16 x, uint16 y);
void Sprite_SpawnThrowableTerrain(uint8 what, uint16 x, uint16 y);
int Sprite_SpawnThrowableTerrain_silently(uint8 what, uint16 x, uint16 y);
void Sprite_SpawnSecret(int k);
void Sprite_Main();
void Oam_ResetRegionBases();
void Sprite_TimersAndOam(int k);
void Sprite_Get16BitCoords(int k);
void Sprite_ExecuteSingle(int k);
void Sprite_inactiveSprite(int k);
void SpriteModule_Fall1(int k);
void SpriteModule_Drown(int k);
void Sprite_DrawDistress_custom(uint16 xin, uint16 yin, uint8 time);
void Sprite_CheckIfLifted_permissive(int k);
void Entity_ApplyRumbleToSprites(SpriteHitBox *hb);
void Sprite_ZeroVelocity_XY(int k);
bool Sprite_HandleDraggingByAncilla(int k);
bool Sprite_ReturnIfPhasingOut(int k);
void Sprite_CheckAbsorptionByPlayer(int k);
void Sprite_HandleAbsorptionByPlayer(int k);
bool SpriteDraw_AbsorbableTransient(int k, bool transient);
void Sprite_DrawNumberedAbsorbable(int k, int a);
void Sprite_BounceOffWall(int k);
void Sprite_InvertSpeed_XY(int k);
bool Sprite_ReturnIfInactive(int k);
bool Sprite_ReturnIfPaused(int k);
void SpriteDraw_SingleLarge(int k);
void Sprite_PrepAndDrawSingleLargeNoPrep(int k, PrepOamCoordsRet *info);
void SpriteDraw_Shadow_custom(int k, PrepOamCoordsRet *info, uint8 a);
void SpriteDraw_Shadow(int k, PrepOamCoordsRet *oam);
void SpriteDraw_SingleSmall(int k);
void Sprite_DrawThinAndTall(int k);
void SpriteModule_Carried(int k);
void CarriedSprite_CheckForThrow(int k);
void SpriteModule_Stunned(int k);
void ThrownSprite_TileAndSpriteInteraction(int k);
void Sprite_Func8(int k);
void Sprite_Func22(int k);
void ThrowableScenery_InteractWithSpritesAndTiles(int k);
void ThrownSprite_CheckDamageToSprites(int k);
void ThrownSprite_CheckDamageToSingleSprite(int k, int j);
void Sprite_ApplyRicochet(int k);
void ThrowableScenery_TransmuteIfValid(int k);
void ThrowableScenery_TransmuteToDebris(int k);
void Sprite_ScheduleForBreakage(int k);
void Sprite_HalveSpeed_XY(int k);
void Sprite_SpawnLeapingFish(int k);
void SpriteStunned_Main_Func1(int k);
void SpriteModule_Poof(int k);
void Sprite_PrepOamCoord(int k, PrepOamCoordsRet *ret);
bool Sprite_PrepOamCoordOrDoubleRet(int k, PrepOamCoordsRet *ret);
void Sprite_CheckTileCollision2(int k);
void Sprite_CheckTileCollisionSingleLayer(int k);
void Sprite_CheckForTileInDirection_horizontal(int k, int yy);
void Sprite_CheckForTileInDirection_vertical(int k, int yy);
void SpriteFall_AdjustPosition(int k);
bool Sprite_CheckTileInDirection(int k, int yy);
bool Sprite_CheckTileProperty(int k, int j);
uint8 GetTileAttribute(uint8 floor, uint16 *x, uint16 y);
uint8 Sprite_GetTileAttribute(int k, uint16 *x, uint16 y);
bool Entity_CheckSlopedTileCollision(uint16 x, uint16 y);
void Sprite_MoveXY(int k);
void Sprite_MoveX(int k);
void Sprite_MoveY(int k);
void Sprite_MoveZ(int k);
ProjectSpeedRet Sprite_ProjectSpeedTowardsLink(int k, uint8 vel);
void Sprite_ApplySpeedTowardsLink(int k, uint8 vel);
ProjectSpeedRet Sprite_ProjectSpeedTowardsLocation(int k, uint16 x, uint16 y, uint8 vel);
uint8 Sprite_DirectionToFaceLink(int k, PointU8 *coords_out);
PairU8 Sprite_IsRightOfLink(int k);
PairU8 Sprite_IsBelowLink(int k);
PairU8 Sprite_IsRightOfLocation(int k, uint16 x);
PairU8 Sprite_IsBelowLocation(int k, uint16 y);
uint8 Sprite_DirectionToFaceLocation(int k, uint16 x, uint16 y);
void Guard_ParrySwordAttacks(int k);
void Sprite_AttemptZapDamage(int k);
void Ancilla_CheckDamageToSprite_preset(int k, int a);
void Sprite_Func15(int k, int a);
void Sprite_CalculateSwordDamage(int k);
void Sprite_ApplyCalculatedDamage(int k, int a);
void Sprite_GiveDamage(int k, uint8 dmg, uint8 r0_hit_timer);
void Sprite_Func18(int k, uint8 new_type);
void Sprite_MiniMoldorm_Recoil(int k);
void Sprite_Func3(int k);
bool Sprite_CheckDamageToLink(int k);
bool Sprite_CheckDamageToPlayer_1(int k);
bool Sprite_CheckDamageToLink_same_layer(int k);
bool Sprite_CheckDamageToLink_ignore_layer(int k);
bool Sprite_SetupHitBox00(int k);
bool Sprite_ReturnIfLifted(int k);
bool Sprite_ReturnIfLiftedPermissive(int k);
uint8 Sprite_CheckDamageFromLink(int k);
void Sprite_AttemptDamageToLinkWithCollisionCheck(int k);
void Sprite_AttemptDamageToLinkPlusRecoil(int k);
void Player_SetupActionHitBox(SpriteHitBox *hb);
void Link_UpdateHitBoxWithSword(SpriteHitBox *hb);
void Sprite_DoHitBoxesFast(int k, SpriteHitBox *hb);
void Sprite_ApplyRecoilToLink(int k, uint8 vel);
void Link_PlaceWeaponTink();
void Sprite_PlaceWeaponTink(int k);
void Sprite_PlaceRupulseSpark_2(int k);
void Link_SetupHitBox_conditional(SpriteHitBox *hb);
void Link_SetupHitBox(SpriteHitBox *hb);
void Sprite_SetupHitBox(int k, SpriteHitBox *hb);
bool CheckIfHitBoxesOverlap(SpriteHitBox *hb);
void Oam_AllocateDeferToPlayer(int k);
void SpriteModule_Die(int k);
void Sprite_DoTheDeath(int k);
void ForcePrizeDrop(int k, uint8 prize, uint8 slot);
void PrepareEnemyDrop(int k, uint8 item);
void SpriteDeath_Func4(int k);
void SpriteDeath_DrawPoof(int k);
void SpriteModule_Fall2(int k);
void SpriteDraw_FallingHelmaBeetle(int k);
void SpriteDraw_FallingHumanoid(int k);
void Sprite_CorrectOamEntries(int k, int n, uint8 islarge);
bool Sprite_ReturnIfRecoiling(int k);
bool Sprite_CheckIfLinkIsBusy();
void Sprite_SetSpawnedCoordinates(int k, SpriteSpawnInfo *info);
bool Sprite_CheckIfScreenIsClear();
bool Sprite_CheckIfRoomIsClear();
bool Sprite_CheckIfOverlordsClear();
void Sprite_InitializeMirrorPortal();
void Sprite_InitializeSlots();
void Garnish_ExecuteUpperSlots();
void Garnish_ExecuteLowerSlots();
void Garnish_ExecuteSingle(int k);
void Garnish15_ArrghusSplash(int k);
void Garnish13_PyramidDebris(int k);
void Garnish11_WitheringGanonBatFlame(int k);
void Garnish10_GanonBatFlame(int k);
void Garnish0C_TrinexxIceBreath(int k);
void Garnish14_KakKidDashDust(int k);
void Garnish_WaterTrail(int k);
void Garnish0A_CannonSmoke(int k);
void Garnish09_LightningTrail(int k);
void Garnish_CheckPlayerCollision(int k, int x, int y);
void Garnish07_BabasuFlash(int k);
void Garnish08_KholdstareTrail(int k);
void Garnish06_ZoroTrail(int k);
void Garnish12_Sparkle(int k);
void Garnish_SimpleSparkle(int k);
void Garnish0E_TrinexxFireBreath(int k);
void Garnish0F_BlindLaserTrail(int k);
void Garnish04_LaserTrail(int k);
bool Garnish_ReturnIfPrepFails(int k, Point16U *pt);
void Garnish03_FallingTile(int k);
void Garnish01_FireSnakeTail(int k);
void Garnish02_MothulaBeamTrail(int k);
void Dungeon_ResetSprites();
void Dungeon_CacheTransSprites();
void Sprite_DisableAll();
void Dungeon_LoadSprites();
void Sprite_ManuallySetDeathFlagUW(int k);
int Dungeon_LoadSingleSprite(int k, const uint8 *src);
void Dungeon_LoadSingleOverlord(const uint8 *src);
void Sprite_ResetAll();
void Sprite_ResetAll_noDisable();
void Sprite_ReloadAll_Overworld();
void Sprite_OverworldReloadAll_justLoad();
void Overworld_LoadSprites();
void Sprite_ActivateAllProxima();
void Sprite_ProximityActivation();
void Sprite_ActivateWhenProximal();
void Sprite_ActivateWhenProximalBig();
void Sprite_Overworld_ProximityMotivatedLoad(uint16 x, uint16 y);
void Overworld_LoadProximaSpriteIfAlive(uint16 blk);
void SpriteExplode_SpawnEA(int k);
void Sprite_KillFriends();
void Garnish16_ThrownItemDebris(int k);
void ScatterDebris_Draw(int k, Point16U pt);
void Sprite_KillSelf(int k);
void SpritePrep_LoadProperties(int k);
void SpritePrep_LoadPalette(int k);
void SpritePrep_ResetProperties(int k);
uint8 Oam_AllocateFromRegionA(uint8 num);
uint8 Oam_AllocateFromRegionB(uint8 num);
uint8 Oam_AllocateFromRegionC(uint8 num);
uint8 Oam_AllocateFromRegionD(uint8 num);
uint8 Oam_AllocateFromRegionE(uint8 num);
uint8 Oam_AllocateFromRegionF(uint8 num);
uint8 Oam_GetBufferPosition(uint8 num, uint8 y);
void Sprite_NullifyHookshotDrag();
void Overworld_SubstituteAlternateSecret();
void Sprite_ApplyConveyor(int k, int j);
uint8 Sprite_BounceFromTileCollision(int k);
void ExecuteCachedSprites();
void UncacheAndExecuteSprite(int k);
uint8 Sprite_ConvertVelocityToAngle(uint8 x, uint8 y);
int Sprite_SpawnDynamically(int k, uint8 what, SpriteSpawnInfo *info);
int Sprite_SpawnDynamicallyEx(int k, uint8 what, SpriteSpawnInfo *info, int j);
void SpriteFall_Draw(int k, PrepOamCoordsRet *info);
void Sprite_GarnishSpawn_Sparkle_limited(int k, uint16 x, uint16 y);
int Sprite_GarnishSpawn_Sparkle(int k, uint16 x, uint16 y);
void Sprite_BehaveAsBarrier(int k);
void Sprite_HaltAllMovement();
int ReleaseFairy();
void Sprite_DrawRippleIfInWater(int k);
