/**
 * WASM Bridge — singleton holding the Emscripten module reference and game state.
 * All other game modules import from here to access the running module.
 */

import type { EmscriptenModule, GameState } from './types';

type GameStateListener = (state: GameState) => void;

let currentModule: EmscriptenModule | null = null;
let currentState: GameState = { status: 'idle', error: null };
let currentProfileId: string | null = null;
const listeners = new Set<GameStateListener>();

function setState(next: GameState): void {
  currentState = next;
  for (const fn of listeners) {
    try { fn(next); } catch { /* ignore */ }
  }
}

function getGameState(): GameState {
  return currentState;
}

function getModule(): EmscriptenModule | null {
  return currentModule;
}

function setModule(mod: EmscriptenModule | null): void {
  currentModule = mod;
}

function getProfileId(): string | null {
  return currentProfileId;
}

function setProfileId(id: string | null): void {
  currentProfileId = id;
}

function subscribeGameState(fn: GameStateListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Push a SNES input bitmask to the running WASM module.
 * Called by InputManager each frame.
 */
function setInput(mask: number): void {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return;
  mod.ccall('WasmSetInput', null, ['number'], [mask]);
}

// ─── Game commands (pause, reset, cheats) ───

/** Pause or unpause the game at the WASM/C level. */
function wasmSetPaused(paused: boolean): void {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return;
  mod.ccall('WasmSetPaused', null, ['number'], [paused ? 1 : 0]);
}

/** Query whether the game is paused at the WASM/C level. */
function wasmGetPaused(): boolean {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return false;
  return mod.ccall('WasmGetPaused', 'number', [], []) !== 0;
}

/** Toggle game pause at the WASM/C level. */
function wasmTogglePause(): void {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return;
  mod.ccall('WasmTogglePause', null, [], []);
}

/** Reset the game. warm=true preserves SRAM, warm=false is a cold reset. */
function wasmReset(warm: boolean): void {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return;
  mod.ccall('WasmReset', null, ['number'], [warm ? 1 : 0]);
}

/** Execute a cheat command. 'w' = health, 'W' = equipment, 'o' = keys. */
function wasmCheat(cmd: string): void {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return;
  mod.ccall('WasmCheat', null, ['number'], [cmd.charCodeAt(0)]);
}

/** Force the PPU backdrop color (CGRAM[0]) to black every frame. */
function wasmSetForceBackdropBlack(enabled: boolean): void {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return;
  mod.ccall('WasmSetForceBackdropBlack', null, ['number'], [enabled ? 1 : 0]);
}

// ─── Viewport Info (for edge glow shader) ───

interface ViewportInfo {
  /** Game module: 7=dungeon, 9=overworld, 14=menu, 0/1=intro/title */
  mainModule: number;
  submodule: number;
  /** Max extra pixels per side allowed by config */
  extraLeftRight: number;
  /** Actual valid map content pixels on left beyond base 256 */
  extraLeftCur: number;
  /** Actual valid map content pixels on right beyond base 256 */
  extraRightCur: number;
  /** Actual valid map content pixels below base 224 */
  extraBottomCur: number;
  /** Total render width */
  snesWidth: number;
  /** Total render height */
  snesHeight: number;
  /** Pixels of black on the left edge (no map content) */
  blackLeft: number;
  /** Pixels of black on the right edge (no map content) */
  blackRight: number;
  /** Pixels of black on the bottom edge (no map content) */
  blackBottom: number;
  /** Whether the game is in active gameplay (dungeon or overworld) */
  isGameplay: boolean;
  /** Physical location module (unaffected by text/menu overlays) */
  locationModule: number;
  /** Location type: 0=overworld/other, 1=house/cave, 2=dungeon */
  locationType: number;
  /** Camera world X position (BG2 horizontal scroll) */
  cameraX: number;
  /** Camera world Y position (BG2 vertical scroll) */
  cameraY: number;
  /** Link's world X position */
  linkX: number;
  /** Link's world Y position */
  linkY: number;
}

export interface LiveSpriteInfo {
  slot: number;
  type: number;
  state: number;
  subtype: number;
  subtype2: number;
  e: number;
  x: number;
  y: number;
}

/**
 * Read viewport/game-state info from WASM for shader edge detection.
 * Returns null if the module isn't running or the export doesn't exist yet.
 */
function wasmGetViewportInfo(): ViewportInfo | null {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return null;
  try {
    const ptr = mod.ccall('WasmGetViewportInfo', 'number', [], []) as number;
    if (!ptr) return null;
    const heap = mod.HEAPU8;
    const mainModule = heap[ptr];
    const submodule = heap[ptr + 1];
    const extraLeftRight = heap[ptr + 2];
    const extraLeftCur = heap[ptr + 3];
    const extraRightCur = heap[ptr + 4];
    const extraBottomCur = heap[ptr + 5];
    const snesWidth = heap[ptr + 6] | (heap[ptr + 7] << 8);
    const snesHeight = heap[ptr + 8] | (heap[ptr + 9] << 8);
    const locationModule = heap[ptr + 10];
    const locationType = heap[ptr + 11]; // 0=overworld, 1=house/cave, 2=dungeon
    const cameraX = heap[ptr + 12] | (heap[ptr + 13] << 8);
    const cameraY = heap[ptr + 14] | (heap[ptr + 15] << 8);
    const linkX = heap[ptr + 16] | (heap[ptr + 17] << 8);
    const linkY = heap[ptr + 18] | (heap[ptr + 19] << 8);

    // Black pixels = max extra - actual rendered extra
    const blackLeft = extraLeftRight - extraLeftCur;
    const blackRight = extraLeftRight - extraRightCur;
    // Bottom: extend_y adds 16 rows (240-224), extraBottomCur = how many have content
    const blackBottom = snesHeight === 240 ? (16 - extraBottomCur) : 0;

    // Active gameplay = location module 7 (dungeon) or 9 (overworld)
    const isGameplay = (locationModule === 7 || locationModule === 9);

    return {
      mainModule, submodule, extraLeftRight, extraLeftCur, extraRightCur,
      extraBottomCur, snesWidth, snesHeight, blackLeft, blackRight, blackBottom,
      isGameplay, locationModule, locationType, cameraX, cameraY, linkX, linkY,
    };
  } catch {
    return null;
  }
}

/**
 * Render a clean frame (no HUD/BG3) into WASM memory and return the pixel data.
 * Returns null if the module isn't running or the export doesn't exist.
 */
function wasmRenderCleanFrame(): { data: Uint8Array; width: number; height: number } | null {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return null;
  try {
    const ptr = mod.ccall('WasmRenderCleanFrame', 'number', [], []) as number;
    if (!ptr) return null;
    const width = mod.ccall('WasmGetCleanFrameWidth', 'number', [], []) as number;
    const height = mod.ccall('WasmGetCleanFrameHeight', 'number', [], []) as number;
    if (!width || !height) return null;
    const byteLength = width * height * 4;
    const data = mod.HEAPU8.subarray(ptr, ptr + byteLength);
    return { data, width, height };
  } catch {
    return null;
  }
}

// ─── Game UI State (for React overlay) ───

/** Size of the UI state buffer exported from C */
const UI_STATE_BUFFER_SIZE = 109;

/**
 * Read the raw game UI state buffer from WASM.
 * Returns the HEAP pointer and HEAPU8 reference, or null if unavailable.
 */
function wasmGetGameUIState(): { heap: Uint8Array; ptr: number } | null {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return null;
  try {
    const ptr = mod.ccall('WasmGetGameUIState', 'number', [], []) as number;
    if (!ptr) return null;
    return { heap: mod.HEAPU8, ptr };
  } catch {
    return null;
  }
}

/** Set the UI overlay mode bitmask (controls native rendering suppression). */
function wasmSetUIOverlayMode(mode: number): void {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return;
  mod.ccall('WasmSetUIOverlayMode', null, ['number'], [mode]);
}

/** Get the current UI overlay mode bitmask. */
function wasmGetUIOverlayMode(): number {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return 0;
  return mod.ccall('WasmGetUIOverlayMode', 'number', [], []) as number;
}

/**
 * Get in-game menu state: 0=gameplay, 1=opening, 2=open, 3=closing.
 * Used to sync enhanced HUD overlay transitions with the native pause animation.
 */
function wasmGetMenuState(): number {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return 0;
  try {
    return mod.ccall('WasmGetMenuState', 'number', [], []) as number;
  } catch {
    return 0;
  }
}

export interface OverworldVariantInfo {
  /** sram_progress_indicator: 0=intro, 1=post-uncle, 2=zelda-rescued, 3=agahnim-defeated */
  progressIndicator: number;
  /** save_ow_event_info[screen] for the current screen */
  screenEventFlags: number;
  /** Whether the event overlay has been applied (bit 0x20) */
  eventOverlayActive: boolean;
  /** Human label for the current variant phase */
  phaseLabel: string;
}

const PHASE_LABELS = ['intro', 'rain (pre-Sanctuary)', 'post-Sanctuary', 'post-Agahnim'];

// ─── Universal Progress Indicator ───

interface GameProgressInfo {
  /** Raw sram_progress_indicator value (0-3) */
  tier: number;
  /** Human-readable phase label */
  label: string;
}

/**
 * Read the game's progress indicator from WRAM — works indoors or outdoors.
 * Returns null only when game is not running.
 */
function wasmGetProgressIndicator(): GameProgressInfo | null {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return null;
  try {
    const progPtr = mod.ccall('WasmGetProgressFlags', 'number', [], []) as number;
    if (!progPtr) return null;
    const tier = mod.HEAPU8[progPtr];
    return { tier, label: PHASE_LABELS[tier] ?? `unknown (${tier})` };
  } catch {
    return null;
  }
}

/**
 * Read the current overworld variant state: progress tier + per-screen event flags.
 */
function wasmGetOverworldVariant(screenIndex: number): OverworldVariantInfo | null {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return null;
  try {
    const heap = mod.HEAPU8;

    const progPtr = mod.ccall('WasmGetProgressFlags', 'number', [], []) as number;
    if (!progPtr) return null;
    const progressIndicator = heap[progPtr];

    const owPtr = mod.ccall('WasmGetOverworldFlags', 'number', [], []) as number;
    if (!owPtr) return null;
    const screenEventFlags = heap[owPtr + (screenIndex & 0x7F)];
    const eventOverlayActive = !!(screenEventFlags & 0x20);

    return {
      progressIndicator,
      screenEventFlags,
      eventOverlayActive,
      phaseLabel: PHASE_LABELS[progressIndicator] ?? `unknown (${progressIndicator})`,
    };
  } catch {
    return null;
  }
}

/**
 * Read both indoor room collision attr layers (64×64 each) from dung_bg2_attr_table.
 * Layer 0 = offset 0 (upper, link_is_on_lower_level=0) — main walkable floor, has cliffs/ledges.
 * Layer 1 = offset 0x1000 (lower, link_is_on_lower_level=1) — underneath overlapping areas.
 * Returns raw data with no modifications. Works with live game state.
 */
function wasmGetIndoorDualLayerGrids(): { layer0: number[][]; layer1: number[][]; stairTiles: Array<{ row: number; col: number }> } | null {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return null;
  try {
    const ptr = mod.ccall('WasmGetIndoorAttrTable', 'number', [], []) as number;
    if (!ptr) return null;
    const heap = mod.HEAPU8;
    const layer0: number[][] = Array.from({ length: 64 }, () => new Array<number>(64));
    const layer1: number[][] = Array.from({ length: 64 }, () => new Array<number>(64));
    const stairTiles: Array<{ row: number; col: number }> = [];
    let hasDifference = false;
    for (let r = 0; r < 64; r++) {
      const row0 = ptr + r * 64;
      const row1 = ptr + 0x1000 + r * 64;
      for (let c = 0; c < 64; c++) {
        let a0 = heap[row0 + c];
        let a1 = heap[row1 + c];
        // Record upper-floor stair positions (raw 0x1C on BG1/layer1) before normalization.
        // Only layer1 stairs are valid BFS seeds — layer0-only stairs (ground-floor transitions)
        // have BG1=0x00 (void) and would seed into the void area.
        if (a1 === 0x1C) {
          stairTiles.push({ row: r, col: c });
        }
        // 0x1C is a filler/stair-detection value that appears on both BG2 and BG1
        // when a layer has no real content at that position. Normalize it away
        // by copying from the other layer so it never causes a false split display.
        if (a0 === 0x1C && a1 !== 0x1C) a0 = a1;
        if (a1 === 0x1C && a0 !== 0x1C) a1 = a0;
        // If both are 0x1C, they're equal — no split (both filler).
        layer0[r][c] = a0;
        layer1[r][c] = a1;
        if (a0 !== a1) hasDifference = true;
      }
    }
    // If layers are identical after normalization, this room doesn't have
    // meaningful dual-layer collision — discard.
    if (!hasDifference) return null;
    return { layer0, layer1, stairTiles };
  } catch {
    return null;
  }
}

/**
 * Get the raw indoor layer0 collision grid from live game state.
 * Unlike wasmGetIndoorDualLayerGrids, this ALWAYS returns layer0 when game is running
 * indoors, regardless of whether layers differ. Returns null only when truly unavailable.
 */
function wasmGetIndoorLayer0Grid(): number[][] | null {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return null;
  try {
    const ptr = mod.ccall('WasmGetIndoorAttrTable', 'number', [], []) as number;
    if (!ptr) return null;
    const heap = mod.HEAPU8;
    const grid: number[][] = Array.from({ length: 64 }, () => new Array<number>(64));
    for (let r = 0; r < 64; r++) {
      for (let c = 0; c < 64; c++) {
        grid[r][c] = heap[ptr + r * 64 + c];
      }
    }
    return grid;
  } catch {
    return null;
  }
}

/**
 * Get Link's current layer from live game state.
 * Returns 0 (upper/layer0) or 1 (lower/layer1), or null if game not running.
 */
function wasmGetLinkLayer(): 0 | 1 | null {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return null;
  try {
    return (mod.ccall('WasmGetLinkIsOnLowerLevel', 'number', [], []) as number) !== 0 ? 1 : 0;
  } catch {
    return null;
  }
}

/**
 * Build a 64×64 collision attr grid for any overworld screen (headless, no game state dependency).
 * Returns a flat Uint8Array of 4096 bytes (row-major), or null if WASM unavailable.
 */
function wasmBuildOverworldAttrGrid(screenIndex: number): Uint8Array | null {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return null;
  try {
    const ptr = mod.ccall('WasmBuildOverworldAttrGrid', 'number', ['number'], [screenIndex]) as number;
    if (!ptr) return null;
    return new Uint8Array(mod.HEAPU8.buffer, ptr, 64 * 64);
  } catch {
    return null;
  }
}

/**
 * Build a 64×64 collision attr grid for any indoor room (headless, loads room from asset data).
 * Returns a flat Uint8Array of 4096 bytes (row-major), or null if WASM unavailable.
 */
function wasmBuildRoomAttrGrid(roomId: number): Uint8Array | null {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return null;
  try {
    const ptr = mod.ccall('WasmBuildRoomAttrGrid', 'number', ['number'], [roomId]) as number;
    if (!ptr) return null;
    return new Uint8Array(mod.HEAPU8.buffer, ptr, 64 * 64);
  } catch {
    return null;
  }
}

// ─── Room Layout & Door Boundary Info (intra-room screen transitions) ───

export interface RoomLayoutInfo {
  layout: number;
  shape: '2x2' | '2x1' | '1x2' | '1x1';
  quadrantFullsizeX: number;
  quadrantFullsizeY: number;
  quadrantX: number;
  quadrantY: number;
  /** Which edges of the current quadrant are intra-room boundaries (not room-to-room). */
  intraEdges: ('north' | 'south' | 'east' | 'west')[];
}

export interface DoorBoundaryTile {
  direction: 'north' | 'south' | 'west' | 'east';
  col: number;
  row: number;
  doorType: number;
  isOpen: boolean;
}

const LAYOUT_SHAPES: Array<'2x2' | '2x1' | '1x2' | '1x1'> = ['2x2', '2x2', '2x1', '2x1', '1x2', '1x2', '1x1', '1x1'];
const DIR_NAMES: Array<'north' | 'south' | 'west' | 'east'> = ['north', 'south', 'west', 'east'];

function wasmGetRoomLayoutInfo(): RoomLayoutInfo | null {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return null;
  try {
    const ptr = mod.ccall('WasmGetRoomLayoutInfo', 'number', [], []) as number;
    if (!ptr) return null;
    const heap = mod.HEAPU8;
    const layout = heap[ptr];
    const qfx = heap[ptr + 1];
    const qfy = heap[ptr + 2];
    const qx = heap[ptr + 3];
    const qy = heap[ptr + 4];
    const shape = LAYOUT_SHAPES[layout] ?? '1x1';

    // Compute which edges are intra-room boundaries for the current quadrant.
    // An edge is intra-room if: the room extends in that direction AND the axis isn't merged (blastwall).
    const intraEdges: ('north' | 'south' | 'east' | 'west')[] = [];
    if (shape === '2x2' || shape === '1x2') {
      // Vertical axis has two screens
      if (qfy === 0) { // not merged by blastwall
        if (qy === 0) intraEdges.push('south');   // upper quad → south edge is intra-room
        if (qy === 2) intraEdges.push('north');   // lower quad → north edge is intra-room
      }
    }
    if (shape === '2x2' || shape === '2x1') {
      // Horizontal axis has two screens
      if (qfx === 0) { // not merged by blastwall
        if (qx === 0) intraEdges.push('east');    // left quad → east edge is intra-room
        if (qx === 1) intraEdges.push('west');    // right quad → west edge is intra-room
      }
    }

    return { layout, shape, quadrantFullsizeX: qfx, quadrantFullsizeY: qfy, quadrantX: qx, quadrantY: qy, intraEdges };
  } catch {
    return null;
  }
}

function wasmGetRoomDoorBoundaryTiles(): DoorBoundaryTile[] {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return [];
  try {
    const ptr = mod.ccall('WasmGetRoomDoorBoundaryTiles', 'number', [], []) as number;
    if (!ptr) return [];
    const heap = mod.HEAPU8;
    const count = Math.min(heap[ptr], 16);
    const out: DoorBoundaryTile[] = [];
    for (let i = 0; i < count; i++) {
      const o = ptr + 2 + i * 5;
      out.push({
        direction: DIR_NAMES[heap[o]] ?? 'north',
        col: heap[o + 1],
        row: heap[o + 2],
        doorType: heap[o + 3],
        isOpen: heap[o + 4] !== 0,
      });
    }
    return out;
  } catch {
    return [];
  }
}

export interface RoomStairInfo {
  destRoom: number;
  row: number;
  col: number;
  direction: 'up' | 'down';
}

function wasmGetRoomStairInfo(): RoomStairInfo[] {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return [];
  try {
    const ptr = mod.ccall('WasmGetRoomStairInfo', 'number', [], []) as number;
    if (!ptr) return [];
    const heap = mod.HEAPU8;
    const count = Math.min(heap[ptr], 4);
    const out: RoomStairInfo[] = [];
    for (let i = 0; i < count; i++) {
      const o = ptr + 2 + i * 4;
      out.push({
        destRoom: heap[o + 0],
        row: heap[o + 1],
        col: heap[o + 2],
        direction: heap[o + 3] ? 'down' : 'up',
      });
    }
    return out;
  } catch {
    return [];
  }
}

export interface RoomWalkBoundary {
  destRoom: number;
  row: number;
  col: number;
}

/** Get inter-room walk-through boundaries (palace toggles like Castle→Sewer). */
function wasmGetRoomWalkBoundaries(): RoomWalkBoundary[] {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return [];
  try {
    const ptr = mod.ccall('WasmGetRoomWalkBoundaries', 'number', [], []) as number;
    if (!ptr) return [];
    const heap = mod.HEAPU8;
    const count = Math.min(heap[ptr], 4);
    const out: RoomWalkBoundary[] = [];
    for (let i = 0; i < count; i++) {
      const o = ptr + 2 + i * 4;
      out.push({
        destRoom: heap[o + 0] | (heap[o + 1] << 8),
        row: heap[o + 2],
        col: heap[o + 3],
      });
    }
    return out;
  } catch {
    return [];
  }
}

export interface RoomExitDoor {
  col: number;
  row: number;
  direction: 'north' | 'south' | 'west' | 'east';
}

/** Get exit-to-overworld door positions for the current room. */
function wasmGetRoomExitDoors(): RoomExitDoor[] {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return [];
  try {
    const ptr = mod.ccall('WasmGetRoomExitDoors', 'number', [], []) as number;
    if (!ptr) return [];
    const heap = mod.HEAPU8;
    const count = Math.min(heap[ptr], 8);
    const out: RoomExitDoor[] = [];
    for (let i = 0; i < count; i++) {
      const o = ptr + 2 + i * 3;
      out.push({
        col: heap[o + 0],
        row: heap[o + 1],
        direction: DIR_NAMES[heap[o + 2]] ?? 'south',
      });
    }
    return out;
  } catch {
    return [];
  }
}

/** Get the 5 room travel destination bytes from the current room header. */
function wasmGetRoomTravelDestinations(): number[] | null {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return null;
  try {
    const ptr = mod.ccall('WasmGetRoomTravelDestinations', 'number', [], []) as number;
    if (!ptr) return null;
    const heap = mod.HEAPU8;
    return [heap[ptr], heap[ptr + 1], heap[ptr + 2], heap[ptr + 3], heap[ptr + 4]];
  } catch {
    return null;
  }
}

/** Get active Uncle sprite blocker coordinates for indoor early-game variants. */
function wasmGetIndoorUncleBlockers(): Array<{ x: number; y: number }> {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return [];
  try {
    const ptr = mod.ccall('WasmGetIndoorUncleBlockers', 'number', [], []) as number;
    if (!ptr) return [];
    const heap = mod.HEAPU8;
    const count = Math.min(heap[ptr], 2);
    const out: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < count; i++) {
      const o = ptr + 1 + i * 4;
      const x = heap[o + 0] | (heap[o + 1] << 8);
      const y = heap[o + 2] | (heap[o + 3] << 8);
      out.push({ x, y });
    }
    return out;
  } catch {
    return [];
  }
}

/** Get live dynamic blocker coordinates used by navigation flood fill. */
function wasmGetNavigationBlockers(): Array<{ x: number; y: number }> {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return [];
  try {
    const ptr = mod.ccall('WasmGetNavigationBlockers', 'number', [], []) as number;
    if (!ptr) return [];
    const heap = mod.HEAPU8;
    const count = Math.min(heap[ptr], 16);
    const out: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < count; i++) {
      const o = ptr + 1 + i * 4;
      const x = heap[o + 0] | (heap[o + 1] << 8);
      const y = heap[o + 2] | (heap[o + 3] << 8);
      out.push({ x, y });
    }
    return out;
  } catch {
    return [];
  }
}

/** Read all currently active live sprites with debug metadata. */
function wasmGetLiveSprites(): LiveSpriteInfo[] {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return [];
  try {
    const ptr = mod.ccall('WasmGetLiveSprites', 'number', [], []) as number;
    if (!ptr) return [];
    const heap = mod.HEAPU8;
    const count = Math.min(heap[ptr], 16);
    const out: LiveSpriteInfo[] = [];
    for (let i = 0; i < count; i++) {
      const o = ptr + 1 + i * 10;
      out.push({
        slot: heap[o + 0],
        type: heap[o + 1],
        state: heap[o + 2],
        subtype: heap[o + 3],
        subtype2: heap[o + 4],
        e: heap[o + 5],
        x: heap[o + 6] | (heap[o + 7] << 8),
        y: heap[o + 8] | (heap[o + 9] << 8),
      });
    }
    return out;
  } catch {
    return [];
  }
}

/**
 * Read static overworld tutorial guard spawn positions (0x3F/0x40) for the
 * current area, independent of camera proximity loading.
 */
function wasmGetOverworldGuardSpawns(): Array<{ x: number; y: number }> {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return [];
  try {
    const ptr = mod.ccall('WasmGetOverworldGuardSpawns', 'number', [], []) as number;
    if (!ptr) return [];
    const heap = mod.HEAPU8;
    const count = Math.min(heap[ptr], 16);
    const out: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < count; i++) {
      const o = ptr + 1 + i * 4;
      const x = heap[o + 0] | (heap[o + 1] << 8);
      const y = heap[o + 2] | (heap[o + 3] << 8);
      out.push({ x, y });
    }
    return out;
  } catch {
    return [];
  }
}

// ─── Navigation Table Bridges ───

export interface OverworldEntrance {
  area: number;
  pos: number;
  id: number;
}

export interface FallHole {
  area: number;
  pos: number;
  entranceId: number;
}

/** Get all overworld entrance positions from the game tables. */
function wasmGetOverworldEntrances(): OverworldEntrance[] {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return [];
  try {
    const ptr = mod.ccall('WasmGetOverworldEntrances', 'number', [], []) as number;
    if (!ptr) return [];
    const heap = mod.HEAPU8;
    const count = heap[ptr] | (heap[ptr + 1] << 8);
    const out: OverworldEntrance[] = [];
    for (let i = 0; i < count; i++) {
      const o = ptr + 2 + i * 5;
      out.push({
        area: heap[o] | (heap[o + 1] << 8),
        pos: heap[o + 2] | (heap[o + 3] << 8),
        id: heap[o + 4],
      });
    }
    return out;
  } catch {
    return [];
  }
}

/** Get all fall hole positions from the game tables. */
function wasmGetFallHoles(): FallHole[] {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return [];
  try {
    const ptr = mod.ccall('WasmGetFallHoles', 'number', [], []) as number;
    if (!ptr) return [];
    const heap = mod.HEAPU8;
    const count = heap[ptr] | (heap[ptr + 1] << 8);
    const out: FallHole[] = [];
    for (let i = 0; i < count; i++) {
      const o = ptr + 2 + i * 5;
      out.push({
        area: heap[o] | (heap[o + 1] << 8),
        pos: heap[o + 2] | (heap[o + 3] << 8),
        entranceId: heap[o + 4],
      });
    }
    return out;
  } catch {
    return [];
  }
}

/** Get exit-to-screen mapping: indoor room → overworld screen index. */
function wasmGetExitScreenMap(): Map<number, number> {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return new Map();
  try {
    const ptr = mod.ccall('WasmGetExitScreenMap', 'number', [], []) as number;
    if (!ptr) return new Map();
    const heap = mod.HEAPU8;
    const count = heap[ptr] | (heap[ptr + 1] << 8);
    const map = new Map<number, number>();
    for (let i = 0; i < count; i++) {
      const o = ptr + 2 + i * 3;
      const room = heap[o] | (heap[o + 1] << 8);
      const screen = heap[o + 2];
      map.set(room, screen);
    }
    return map;
  } catch {
    return new Map();
  }
}

/** Get the 64-entry area heads table (big screen grouping). */
function wasmGetAreaHeads(): Uint8Array | null {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return null;
  try {
    const ptr = mod.ccall('WasmGetAreaHeads', 'number', [], []) as number;
    if (!ptr) return null;
    return new Uint8Array(mod.HEAPU8.buffer, ptr, 64);
  } catch {
    return null;
  }
}

/** Get entrance ID → room ID mapping from the game tables. */
function wasmGetEntranceRooms(): Uint16Array | null {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return null;
  try {
    const ptr = mod.ccall('WasmGetEntranceRooms', 'number', [], []) as number;
    if (!ptr) return null;
    const heap = mod.HEAPU8;
    const count = heap[ptr] | (heap[ptr + 1] << 8);
    // Read uint16 pairs from the byte buffer
    const out = new Uint16Array(count);
    for (let i = 0; i < count; i++) {
      const o = ptr + 2 + i * 2;
      out[i] = heap[o] | (heap[o + 1] << 8);
    }
    return out;
  } catch {
    return null;
  }
}

/** Get entrance spawn positions (playerX, playerY) for all entrances. */
function wasmGetEntranceSpawns(): Array<{ x: number; y: number }> | null {
  const mod = currentModule;
  if (!mod || currentState.status !== 'running') return null;
  try {
    const ptr = mod.ccall('WasmGetEntranceSpawns', 'number', [], []) as number;
    if (!ptr) return null;
    const heap = mod.HEAPU8;
    const count = heap[ptr] | (heap[ptr + 1] << 8);
    const out: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < count; i++) {
      const o = ptr + 2 + i * 4;
      out.push({
        x: heap[o] | (heap[o + 1] << 8),
        y: heap[o + 2] | (heap[o + 3] << 8),
      });
    }
    return out;
  } catch {
    return null;
  }
}

export {
  getGameState,
  getModule,
  getProfileId,
  setInput,
  setModule,
  setProfileId,
  setState,
  subscribeGameState,
  UI_STATE_BUFFER_SIZE,
  wasmBuildOverworldAttrGrid,
  wasmBuildRoomAttrGrid,
  wasmCheat,
  wasmGetAreaHeads,
  wasmGetEntranceRooms,
  wasmGetEntranceSpawns,
  wasmGetExitScreenMap,
  wasmGetFallHoles,
  wasmGetGameUIState,
  wasmGetIndoorDualLayerGrids,
  wasmGetIndoorLayer0Grid,
  wasmGetLinkLayer,
  wasmGetIndoorUncleBlockers,
  wasmGetLiveSprites,
  wasmGetMenuState,
  wasmGetNavigationBlockers,
  wasmGetOverworldEntrances,
  wasmGetOverworldGuardSpawns,
  wasmGetOverworldVariant,
  wasmGetPaused,
  wasmGetProgressIndicator,
  wasmGetRoomDoorBoundaryTiles,
  wasmGetRoomLayoutInfo,
  wasmGetRoomExitDoors,
  wasmGetRoomStairInfo,
  wasmGetRoomWalkBoundaries,
  wasmGetRoomTravelDestinations,
  wasmGetUIOverlayMode,
  wasmGetViewportInfo,
  wasmRenderCleanFrame,
  wasmReset,
  wasmSetForceBackdropBlack,
  wasmSetPaused,
  wasmSetUIOverlayMode,
  wasmTogglePause
};
export type { DoorBoundaryTile, EntranceData, ExitData, FallHole, GameProgressInfo, LiveSpriteInfo, OverworldEntrance, OverworldVariantInfo, RoomExitDoor, RoomHeader, RoomLayoutInfo, ViewportInfo };
