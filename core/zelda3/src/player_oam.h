#pragma once
#include "types.h"

typedef struct SwordResult {
  uint8 r6;
  uint8 r12;
} SwordResult;

bool PlayerOam_WantInvokeSword();
void CalculateSwordHitBox();
void LinkOam_Main();
uint8 FindMostSignificantBit(uint8 v);
bool LinkOam_SetWeaponVRAMOffsets(int r2, SwordResult *sr);
bool LinkOam_SetEquipmentVRAMOffsets(int r2, SwordResult *sr);
int LinkOam_CalculateSwordSparklePosition(int oam_pos, uint8 oam_x, uint8 oam_y);
void LinkOam_UnusedWeaponSettings(int r4loc, uint8 oam_x, uint8 oam_y);
void LinkOam_DrawDungeonFallShadow(int r4loc, uint8 xcoord);
void LinkOam_DrawFootObject(int r4loc, uint8 oam_x, uint8 oam_y);
void LinkOam_CalculateXOffsetRelativeLink(uint8 x);

// Which terms of the player-hide condition were true this frame and which branch ran, for the OAM
// snapshot. Written only when developer tools are on; see state_queries_oam.c for the byte layout.
extern uint8 g_link_hide_debug[6];

