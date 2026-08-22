/* @layer shared-game-data @kind data */
/**
 * Every sound the game can ask for, per sound-chip channel.
 *
 * Transcribed from the decompilation: the id is the low 6 bits of the channel write (bits 6-7
 * carry stereo pan), and `triggers` names the functions that raise it. A pack replaces a sound by
 * claiming its id; anything unclaimed keeps playing from the chip.
 *
 * Everything here is derived from the source and can be regenerated. The human-readable names are
 * NOT derivable, so they live in sound-names.ts and are merged in on read.
 */

import type { SoundChannel } from '@shared/types/msu-manifest';
import { soundName } from './sound-names';

interface GameSound {
  channel: SoundChannel;
  /** The id as the game writes it, before pan bits. */
  id: number;
  /** Plain-language name, merged in from sound-names.ts. Null when that id has none. */
  label: string | null;
  /** Functions that raise this sound, busiest first. */
  triggers: string[];
  /** How many call sites raise it — a rough measure of how often it is heard. */
  sites: number;
}

/** Which sound-chip port each channel is, for reference. */
const SOUND_CHANNEL_PORTS: Record<SoundChannel, string> = {
  ambient: 'APUI01', sfx1: 'APUI02', sfx2: 'APUI03',
};

/** A row as stored: everything the generator can produce, with no name. */
type RawGameSound = Omit<GameSound, 'label'>;

const GAME_SOUNDS: readonly RawGameSound[] = [
  // -- ambient (APUI01) --
  { channel: 'ambient', id: 0x01, sites: 2, triggers: ['PreOverworld_LoadProperties', 'Overworld_LoadOverlays2'] },
  { channel: 'ambient', id: 0x03, sites: 2, triggers: ['Module_PreDungeon_setAmbientSfx', 'Hud_FloorIndicator'] },
  { channel: 'ambient', id: 0x05, sites: 25, triggers: ['Death_Func1', 'Ancilla22_ItemReceipt', 'Ancilla43_GanonsTowerCutscene', 'RoomTag_MovingWall_East'] },
  { channel: 'ambient', id: 0x07, sites: 6, triggers: ['RoomTag_MovingWallTorchesCheck', 'Overworld_AnimateEntrance_Mire', 'Overworld_AnimateEntrance_GanonsTower', 'Sprite_57_DesertStatue'] },
  { channel: 'ambient', id: 0x09, sites: 3, triggers: ['Ancilla22_ItemReceipt', 'KillAghanim_Func6', 'Overworld_AnimateEntrance_GanonsTower'] },
  { channel: 'ambient', id: 0x0B, sites: 1, triggers: ['FluteKid_Human'] },
  { channel: 'ambient', id: 0x0D, sites: 2, triggers: ['Witch_AcceptShroom', 'Sprite_3A_MagicBat'] },
  { channel: 'ambient', id: 0x0F, sites: 2, triggers: ['Ancilla29_MilestoneItemReceipt', 'Module0E_0B_SaveMenu'] },
  { channel: 'ambient', id: 0x11, sites: 1, triggers: ['Link_PerformDesertPrayer'] },
  { channel: 'ambient', id: 0x13, sites: 2, triggers: ['Sprite_54_Lanmolas', 'Sprite_Blind_Blind_Blind'] },
  { channel: 'ambient', id: 0x15, sites: 1, triggers: ['Module07_1A_RoomDraw_OpenTriforceDoor_bounce'] },
  { channel: 'ambient', id: 0x17, sites: 2, triggers: ['AncillaAdd_ExplodingWeatherVane', 'Sprite_FluteKid_Stumpy'] },
  // -- sfx1 (APUI02) --
  { channel: 'sfx1', id: 0x01, sites: 2, triggers: ['Intro_PeriodicSwordAndIntroFlash', 'Credits_HandleSceneFade'] },
  { channel: 'sfx1', id: 0x02, sites: 2, triggers: ['Stalfos_ThrowBone', 'Sprite_A2_Kholdstare'] },
  { channel: 'sfx1', id: 0x03, sites: 1, triggers: ['Sprite_BatCrash'] },
  { channel: 'sfx1', id: 0x04, sites: 1, triggers: ['Sprite_7A_Agahnim'] },
  { channel: 'sfx1', id: 0x05, sites: 15, triggers: ['AncillaAdd_Boomerang', 'LinkItem_Shovel', 'SpriteStunned_MainEx', 'Ancilla_CheckDamageToSprite_preset'] },
  { channel: 'sfx1', id: 0x06, sites: 3, triggers: ['AncillaAdd_Boomerang', 'Sprite_CheckDamageToLink_ignore_layer', 'Sprite_Fireball'] },
  { channel: 'sfx1', id: 0x07, sites: 3, triggers: ['AncillaAdd_Arrow', 'Octorok_FireLoogie', 'Sprite_94_Tile'] },
  { channel: 'sfx1', id: 0x08, sites: 2, triggers: ['Ancilla09_Arrow', 'Sprite_1B_Arrow'] },
  { channel: 'sfx1', id: 0x09, sites: 1, triggers: ['Ancilla05_Boomerang'] },
  { channel: 'sfx1', id: 0x0A, sites: 1, triggers: ['Ancilla1F_Hookshot'] },
  { channel: 'sfx1', id: 0x0B, sites: 6, triggers: ['AncillaAdd_Bomb', 'Sprite_27_Deadrock', 'Sprite_C4_Thief', 'Thief_CheckCollisionWithLink'] },
  { channel: 'sfx1', id: 0x0C, sites: 21, triggers: ['Ancilla07_Bomb', 'Ancilla33_BlastWallExplosion', 'BombosSpell_ControlBlasting', 'QuakeSpell_ControlBolts'] },
  { channel: 'sfx1', id: 0x0D, sites: 1, triggers: ['AncillaAdd_MagicPowder'] },
  { channel: 'sfx1', id: 0x0E, sites: 1, triggers: ['AncillaAdd_FireRodShot'] },
  { channel: 'sfx1', id: 0x0F, sites: 2, triggers: ['AncillaAdd_IceRodShot', 'Sprite_MiniMoldorm_Recoil'] },
  { channel: 'sfx1', id: 0x10, sites: 1, triggers: ['LinkItem_Hammer'] },
  { channel: 'sfx1', id: 0x11, sites: 3, triggers: ['HandleItemTileAction_Dungeon', 'Overworld_ToolAndTileInteraction', 'ArcheryGame_Host'] },
  { channel: 'sfx1', id: 0x12, sites: 1, triggers: ['LinkItem_Shovel'] },
  { channel: 'sfx1', id: 0x13, sites: 2, triggers: ['CallForDuckIndoors', 'LinkItem_Flute'] },
  { channel: 'sfx1', id: 0x14, sites: 5, triggers: ['AncillaAdd_BunnyPoof', 'AncillaAdd_DwarfPoof', 'Link_HandleBunnyTransformation', 'LinkItem_Cape'] },
  { channel: 'sfx1', id: 0x15, sites: 12, triggers: ['AncillaAdd_BunnyPoof', 'AncillaAdd_DwarfPoof', 'AncillaAdd_BushPoof', 'AncillaAdd_ItemReceipt'] },
  { channel: 'sfx1', id: 0x16, sites: 2, triggers: ['Dungeon_DetectStaircase', 'Module07_11_00_PrepAndReset'] },
  { channel: 'sfx1', id: 0x17, sites: 2, triggers: ['DungeonTransition_AdjustForFatStairScroll', 'Module07_11_0B_PrepDestination'] },
  { channel: 'sfx1', id: 0x18, sites: 2, triggers: ['Dungeon_DetectStaircase', 'Module07_11_00_PrepAndReset'] },
  { channel: 'sfx1', id: 0x19, sites: 2, triggers: ['DungeonTransition_AdjustForFatStairScroll', 'Module07_11_0B_PrepDestination'] },
  { channel: 'sfx1', id: 0x1A, sites: 3, triggers: ['Link_HandleRecoilAndTimer', 'LinkState_Hookshotting', 'TileDetect_MainHandler'] },
  { channel: 'sfx1', id: 0x1B, sites: 2, triggers: ['TileDetect_MainHandler'] },
  { channel: 'sfx1', id: 0x1C, sites: 4, triggers: ['TileDetect_MainHandler', 'Ancilla41_WaterfallSplash', 'Link_HandleRecoilAndTimer'] },
  { channel: 'sfx1', id: 0x1D, sites: 3, triggers: ['Ancilla_HandleLiftLogic', 'Sprite_SpawnThrowableTerrain', 'Sprite_ReturnIfLiftedPermissive'] },
  { channel: 'sfx1', id: 0x1E, sites: 2, triggers: ['Sprite_C7_Pokey', 'Sprite_A4_FallingIce'] },
  { channel: 'sfx1', id: 0x1F, sites: 9, triggers: ['SpawnFallingTile', 'Sprite_CheckDamageFromLink', 'Sprite_14_ThievesTownGrate', 'Sprite_0C_OctorokStone'] },
  { channel: 'sfx1', id: 0x20, sites: 28, triggers: ['StartMovementCollisionChecks_X_HandleOutdoors', 'StartMovementCollisionChecks_Y_HandleOutdoors', 'StartMovementCollisionChecks_Y_HandleIndoors', 'PushBlock_CheckForPit'] },
  { channel: 'sfx1', id: 0x21, sites: 17, triggers: ['Link_HandleRecoilAndTimer', 'Ancilla_HandleLiftLogic', 'LinkHop_HoppingSouthOW', 'LinkState_HandlingJump'] },
  { channel: 'sfx1', id: 0x22, sites: 12, triggers: ['Sprite_21_WaterSwitch', 'AncillaAdd_GraveStone', 'LinkState_TreePull', 'InitializePushBlock'] },
  { channel: 'sfx1', id: 0x23, sites: 1, triggers: ['LinkState_Dashing'] },
  { channel: 'sfx1', id: 0x24, sites: 3, triggers: ['AncillaAdd_Splash', 'HandleDungeonLandingFromPit', 'Sprite_SpawnBigSplash'] },
  { channel: 'sfx1', id: 0x25, sites: 1, triggers: ['PlayerHandler_04_Swimming'] },
  { channel: 'sfx1', id: 0x26, sites: 2, triggers: ['Link_ControlHandler', 'Sprite_AA_Pikit'] },
  { channel: 'sfx1', id: 0x27, sites: 1, triggers: ['Death_PrepFaint'] },
  { channel: 'sfx1', id: 0x28, sites: 11, triggers: ['Sprite_56_WalkingZora', 'HapinessPondRupees_ExecuteRupee', 'Ancilla_TransmuteToSplash', 'Bomb_CheckUndersideSpriteStatus'] },
  { channel: 'sfx1', id: 0x29, sites: 2, triggers: ['OpenChestForItem', 'Hud_RefillLogic'] },
  { channel: 'sfx1', id: 0x2A, sites: 10, triggers: ['AncillaAdd_FireRodShot', 'Ancilla02_FireRodShot', 'AncillaAdd_BombosSpell', 'BombosSpell_ControlFireColumns'] },
  { channel: 'sfx1', id: 0x2B, sites: 6, triggers: ['Hud_RefillLogic', 'RenderText_Draw_Choose2LowOr3', 'RenderText_Draw_Choose2HiOr3', 'RenderText_Draw_Choose3'] },
  { channel: 'sfx1', id: 0x2C, sites: 16, triggers: ['TriforceRoom_HandlePoly', 'Intro_PeriodicSwordAndIntroFlash', 'Credits_HandleSceneFade', 'GameOver_SaveAndOrContinue'] },
  { channel: 'sfx1', id: 0x2D, sites: 1, triggers: ['Hud_RefillLogic'] },
  { channel: 'sfx1', id: 0x2E, sites: 2, triggers: ['RoomTag_WaterOff', 'GanonTowerEntrance_Func1'] },
  { channel: 'sfx1', id: 0x2F, sites: 2, triggers: ['RoomTag_WaterOn', 'RoomTag_WaterGate'] },
  { channel: 'sfx1', id: 0x30, sites: 2, triggers: ['Sprite_SpawnSecret', 'BawkBawk'] },
  { channel: 'sfx1', id: 0x31, sites: 3, triggers: ['RevivalFairy_Main', 'Sprite_HandleAbsorptionByPlayer', 'Sprite_FairyCloud'] },
  { channel: 'sfx1', id: 0x32, sites: 1, triggers: ['LinkItem_Net'] },
  { channel: 'sfx1', id: 0x33, sites: 7, triggers: ['Attract_MaidenWarp_Case3', 'Mirror_SaveRoomData', 'TileDetect_MainHandler', 'Priest_Dying'] },
  { channel: 'sfx1', id: 0x34, sites: 1, triggers: ['Module09_2E_Whirlpool'] },
  { channel: 'sfx1', id: 0x35, sites: 5, triggers: ['AncillaAdd_QuakeSpell', 'Sprite_52_KingZora', 'Sprite_53_ArmosKnight', 'Sprite_54_Lanmolas'] },
  { channel: 'sfx1', id: 0x36, sites: 2, triggers: ['OverworldOverlay_HandleRain', 'Overworld_DwDeathMountainPaletteAnimation'] },
  { channel: 'sfx1', id: 0x37, sites: 1, triggers: ['Player_Sword_SpinAttackJerks_HoldDown'] },
  { channel: 'sfx1', id: 0x3C, sites: 17, triggers: ['Mirror_SaveRoomData', 'LinkItem_Bow', 'LinkItem_Bottle', 'LinkItem_Powder'] },
  // -- sfx2 (APUI03) --
  { channel: 'sfx2', id: 0x01, sites: 4, triggers: ['Ancilla_SwordBeam', 'AncillaAdd_ExplodingSomariaBlock', 'AddSwordBeam', 'Sprite_MagicBat_SpawnLightning'] },
  { channel: 'sfx2', id: 0x02, sites: 3, triggers: ['Overworld_AnimateEntrance_TurtleRock', 'Mothula_FlapWings'] },
  { channel: 'sfx2', id: 0x03, sites: 4, triggers: ['CreatePyramidHole', 'RepelDash', 'GarnishSpawn_PyramidDebris', 'Sprite_8C_Arrghus'] },
  { channel: 'sfx2', id: 0x04, sites: 5, triggers: ['AttractDramatize_Prison', 'Sprite_SpawnSecret', 'Soldier_Func12', 'BoltGuard_TriggerChaseTheme'] },
  { channel: 'sfx2', id: 0x05, sites: 2, triggers: ['Guard_LaunchProjectile', 'Sprite_SpawnFirePhlegm'] },
  { channel: 'sfx2', id: 0x06, sites: 4, triggers: ['Sprite_6A_BallNChain', 'SwishEvery16Frames', 'HelmasaurKing_SwingTail', 'Sprite_8C_Arrghus'] },
  { channel: 'sfx2', id: 0x07, sites: 4, triggers: ['Overlord_SpawnCannonBall', 'OverworldEntrance_AdvanceAndBoom', 'Sprite_66_WallCannonVerticalLeft', 'Sprite_MazeGameLady'] },
  { channel: 'sfx2', id: 0x09, sites: 2, triggers: ['Sprite_MiniMoldorm_Recoil'] },
  { channel: 'sfx2', id: 0x0A, sites: 3, triggers: ['Intro_Init', 'StartMovementCollisionChecks_Y_HandleIndoors', 'StartMovementCollisionChecks_X_HandleIndoors'] },
  { channel: 'sfx2', id: 0x0B, sites: 1, triggers: ['Sprite_Apple'] },
  { channel: 'sfx2', id: 0x0C, sites: 1, triggers: ['VWF_RenderSingle'] },
  { channel: 'sfx2', id: 0x0D, sites: 3, triggers: ['Ancilla22_ItemReceipt', 'Hud_RefillLogic'] },
  { channel: 'sfx2', id: 0x0E, sites: 3, triggers: ['OpenChestForItem', 'OpenBigChest', 'OpenMiniGameChest'] },
  { channel: 'sfx2', id: 0x0F, sites: 2, triggers: ['Ancilla22_ItemReceipt', 'AncillaAdd_ItemReceipt'] },
  { channel: 'sfx2', id: 0x10, sites: 5, triggers: ['FluteMenu_LoadSelectedScreen', 'WorldMap_FadeOut', 'WorldMap_ExitMap', 'DungeonMap_RecoverGFX'] },
  { channel: 'sfx2', id: 0x11, sites: 2, triggers: ['Hud_ClearTileMap', 'Sprite_BombShop_Clerk'] },
  { channel: 'sfx2', id: 0x12, sites: 3, triggers: ['Hud_NormalMenu', 'Hud_BottleMenu', 'Sprite_BombShop_Clerk'] },
  { channel: 'sfx2', id: 0x13, sites: 9, triggers: ['Ancilla_HandleLiftLogic', 'AncillaAdd_TossedPondItem', 'AddHappinessPondRupees', 'CarriedSprite_CheckForThrow'] },
  { channel: 'sfx2', id: 0x14, sites: 4, triggers: ['Dungeon_ProcessTorchesAndDoors', 'Sprite_BonkKey', 'Sprite_CD_SpawnGarnish', 'Sprite_91_StalfosKnight'] },
  { channel: 'sfx2', id: 0x15, sites: 7, triggers: ['Overworld_UseEntrance', 'Dungeon_OpeningLockedDoor_Combined', 'Dungeon_ProcessTorchesAndDoors', 'OperateShutterDoors'] },
  { channel: 'sfx2', id: 0x16, sites: 7, triggers: ['Overworld_AnimateEntrance_Skull', 'OperateShutterDoors', 'Sprite_53_ArmosKnight'] },
  { channel: 'sfx2', id: 0x17, sites: 1, triggers: ['Sprite_6D_Rat'] },
  { channel: 'sfx2', id: 0x18, sites: 1, triggers: ['Sprite_SanctuaryMantle'] },
  { channel: 'sfx2', id: 0x19, sites: 6, triggers: ['Beamos_FireLaser', 'Sprite_SpawnFireball', 'Blind_SpitFireball', 'Sidenexx_ExhaleDanger'] },
  { channel: 'sfx2', id: 0x1A, sites: 1, triggers: ['RoomTag_OperateChestReveal'] },
  { channel: 'sfx2', id: 0x1B, sites: 32, triggers: ['AncillaAdd_GraveStone', 'Dungeon_ProcessTorchesAndDoors', 'Bomb_CheckForDestructibles', 'Overworld_RevealSecret'] },
  { channel: 'sfx2', id: 0x1D, sites: 4, triggers: ['Sprite_GreenCauldron', 'Sprite_BlueCauldron', 'Sprite_RedCauldron', 'Sprite_15_Antifairy'] },
  { channel: 'sfx2', id: 0x1E, sites: 8, triggers: ['Ancilla38_CutsceneDuck', 'Ancilla27_Duck', 'Sprite_6F_Keese', 'Sprite_01_Vulture_bounce'] },
  { channel: 'sfx2', id: 0x1F, sites: 1, triggers: ['LinkState_Pits'] },
  { channel: 'sfx2', id: 0x20, sites: 19, triggers: ['Hud_BottleMenu', 'FluteMenu_HandleSelection', 'FileSelect_Main', 'Hud_NormalMenu'] },
  { channel: 'sfx2', id: 0x21, sites: 2, triggers: ['Credits_HandleSceneFade', 'HelmasaurKing_CheckMaskDamageFromHammer'] },
  { channel: 'sfx2', id: 0x22, sites: 4, triggers: ['SelectFile_Func16', 'Sprite_MiniMoldorm_Recoil', 'Sprite_Blind_Blind_Blind', 'Sprite_CB_TrinexxRockHead'] },
  { channel: 'sfx2', id: 0x23, sites: 7, triggers: ['LinkItem_Ether', 'LinkState_UsingEther', 'LinkItem_Bombos', 'LinkState_UsingBombos'] },
  { channel: 'sfx2', id: 0x24, sites: 9, triggers: ['RenderText_Draw_MessageCharacters', 'DungeonTransition_AdjustForFatStairScroll', 'Dungeon_PlayBlipAndCacheQuadrantVisits', 'WorldMap_PlayerControl'] },
  { channel: 'sfx2', id: 0x25, sites: 6, triggers: ['RoomTag_QuadrantTrigger', 'RoomTag_SwitchTrigger_HoldDoor', 'RoomTag_SwitchTrigger_ToggleDoor', 'Sprite_1E_CrystalSwitch'] },
  { channel: 'sfx2', id: 0x26, sites: 12, triggers: ['AncillaAdd_EtherSpell', 'GameOverText_SweepLeft', 'Sprite_CheckDamageToLink_ignore_layer', 'Sprite_Beamos_Laser'] },
  { channel: 'sfx2', id: 0x27, sites: 3, triggers: ['Attract_MaidenWarp_Case1', 'CutsceneAgahnim_Agahnim', 'Sprite_7A_Agahnim'] },
  { channel: 'sfx2', id: 0x28, sites: 3, triggers: ['Ganon_SelectWarpLocation', 'CutsceneAgahnim_Agahnim', 'Sprite_7A_Agahnim'] },
  { channel: 'sfx2', id: 0x29, sites: 2, triggers: ['Agahnim_PerformAttack', 'Sprite_7B_AgahnimBalls'] },
  { channel: 'sfx2', id: 0x2A, sites: 7, triggers: ['EtherSpell_HandleRadialSpin', 'AncillaAdd_SomariaBlock', 'LinkItem_CaneOfByrna', 'HelmasaurKing_MaybeFireball'] },
  { channel: 'sfx2', id: 0x2B, sites: 7, triggers: ['Attract_MaidenWarp_Case1', 'AttractDramatize_AgahnimAltar', 'HandleLink_From1D', 'LinkState_HoldingBigRock'] },
  { channel: 'sfx2', id: 0x2C, sites: 1, triggers: ['Bee_Bzzt'] },
  { channel: 'sfx2', id: 0x2D, sites: 3, triggers: ['Ancilla09_Arrow', 'AncillaAdd_ItemReceipt', 'Sprite_HeartPiece'] },
  { channel: 'sfx2', id: 0x2E, sites: 1, triggers: ['Link_ReceiveItem'] },
  { channel: 'sfx2', id: 0x2F, sites: 1, triggers: ['Sprite_BonkKey'] },
  { channel: 'sfx2', id: 0x30, sites: 7, triggers: ['ByrnaWindupSpark_TransmuteToNormal', 'Ancilla31_ByrnaSpark', 'DiggingGameGuy_AttemptPrizeSpawn', 'Entity_ApplyRumbleToSprites'] },
  { channel: 'sfx2', id: 0x31, sites: 3, triggers: ['SpriteModule_Fall2', 'Sprite_09_GiantMoldorm', 'Sprite_Trinexx_FinalPhase'] },
  { channel: 'sfx2', id: 0x32, sites: 11, triggers: ['Sprite_93_Bumper', 'Sprite_8C_Arrghus', 'Link_BonkAndSmash', 'SomariaBlock_HandlePlayerInteraction'] },
  { channel: 'sfx2', id: 0x36, sites: 7, triggers: ['Sprite_7B_AgahnimBalls', 'HelmasaurFireball_TriSplit', 'HelmasaurFireball_QuadSplit', 'Wizzrobe_FireBeam'] },
];

const withName = (sound: RawGameSound): GameSound =>
  ({ ...sound, label: soundName(sound.channel, sound.id) });

/** The sounds of one channel, busiest first — the order the studio lists them in. */
const soundsOfChannel = (channel: SoundChannel): GameSound[] =>
  GAME_SOUNDS.filter((s) => s.channel === channel).sort((a, b) => b.sites - a.sites).map(withName);

/** Lookup for a single id, for labelling a claimed sound. */
const gameSound = (channel: SoundChannel, id: number): GameSound | undefined => {
  const found = GAME_SOUNDS.find((s) => s.channel === channel && s.id === id);
  return found === undefined ? undefined : withName(found);
};

export { GAME_SOUNDS, SOUND_CHANNEL_PORTS, soundsOfChannel, gameSound, soundName };
export type { GameSound };
