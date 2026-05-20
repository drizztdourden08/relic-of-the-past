/**
 * PauseMenuView — Enhanced pause menu rendering using extracted sprite tiles.
 *
 * Uses CSS Grid to lay out 5 panels matching the SNES BG3 tilemap.
 * Grid structure (in SNES tiles, with 24px BG3 scroll offset):
 *   Items:     (1,5)→(19,19)   = 19×15 tiles
 *   Name:      (21,5)→(30,10)  = 10×6 tiles
 *   Progress:  (21,11)→(30,19) = 10×9 tiles
 *   Abilities: (1,21)→(19,29)  = 19×9 tiles
 *   Equipment: (21,21)→(30,29) = 10×9 tiles
 *
 * For widescreen: the 256px BG3 content is centered in the wider viewport.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePauseMenu } from '../../hooks/usePauseMenu';
import { PauseItemGrid } from '../../compounds/PauseItemGrid';
import { PauseNamePanel } from '../../compounds/PauseNamePanel';
import { PauseProgressPanel } from '../../compounds/PauseProgressPanel';
import { PauseAbilitiesPanel } from '../../compounds/PauseAbilitiesPanel';
import { PauseEquipmentPanel } from '../../compounds/PauseEquipmentPanel';

/** Standard SNES menu content area */
const MENU_W = 256;
const MENU_H = 224;

/**
 * Grid slot → save RAM index (kHudItemToItemOrg from hud.c).
 * Maps the pause menu cursor position to the inventory save data index.
 */
const GRID_TO_SAVE = [0, 3, 2, 14, 1, 10, 5, 6, 15, 16, 17, 9, 4, 8, 7, 12, 11, 18, 13, 19];

/** Base item names indexed by grid slot position */
const GRID_SLOT_NAMES = [
  'BOW', 'BOMBS', 'HOOKSHOT', 'BOOK', 'BOOMERANG',
  'LAMP', 'FIRE ROD', 'ICE ROD', 'BOTTLE', 'SOMARIA',
  'BYRNA', 'QUAKE', 'MUSHROOM', 'ETHER', 'BOMBOS',
  'FLUTE', 'HAMMER', 'CAPE', 'BUG NET', 'MIRROR',
];

/** Get item name for a grid slot, considering upgrade values */
function getItemNameForSlot(gridSlot: number, items: number[]): string {
  if (gridSlot < 0 || gridSlot >= GRID_TO_SAVE.length) return '';
  const saveIdx = GRID_TO_SAVE[gridSlot];
  const value = items[saveIdx];
  if (!value) return '';
  // Upgrade variants
  if (saveIdx === 0 && value >= 2) return 'SILVER BOW';
  if (saveIdx === 1 && value >= 2) return 'MAGIC BOOM';
  if (saveIdx === 4 && value >= 2) return 'POWDER';
  if (saveIdx === 12 && value >= 2) return 'FLUTE';
  if (saveIdx === 12 && value === 1) return 'SHOVEL';
  return GRID_SLOT_NAMES[gridSlot];
}

function PauseMenuView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [xOffset, setXOffset] = useState(0);
  const [yOffset, setYOffset] = useState(0);

  const computeLayout = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const h = el.clientHeight;
    if (h <= 0) return;

    const canvas = document.getElementById('canvas') as HTMLCanvasElement | null;
    // Canvas buffer is always 2× native (448 for 224-line, 480 for 240-line extendY)
    const nativeW = canvas ? canvas.width / 2 : MENU_W;
    const nativeH = canvas ? canvas.height / 2 : MENU_H;

    // Scale to match the game's pixel size (respects extendY 240-line mode)
    const s = h / nativeH;
    setScale(s);
    setXOffset((nativeW - MENU_W) / 2);
    // In extendY (240-line), the 224px menu content is vertically centered in the 240px viewport
    setYOffset((nativeH - MENU_H) / 2 * s);
  }, []);

  useEffect(() => {
    computeLayout();
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => computeLayout());
    ro.observe(el);
    return () => ro.disconnect();
  }, [computeLayout]);

  const { data, config } = usePauseMenu(scale);
  const { spritesBase } = config;

  const selectedItemName = getItemNameForSlot(data.equippedY, data.items);

  const tile = 8 * scale;

  // CSS Grid: 32 columns × 28 rows (each cell = 1 SNES tile).
  // BG3 scroll offset: tile row 5 in BG space = visual row 2 (offset = 3 tiles).
  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(32, ${tile}px)`,
        gridTemplateRows: `repeat(28, ${tile}px)`,
        marginLeft: xOffset * scale,
        marginTop: yOffset,
      }}>
        {/* Items panel: tiles (1,5)→(19,19), offset -3 = rows 2-16, cols 2-20 */}
        <div style={{ gridColumn: '2 / 21', gridRow: '2 / 17' }}>
          <PauseItemGrid
            items={data.items}
            selectedIndex={data.equippedY}
            gridToSave={GRID_TO_SAVE}
            spritesBase={spritesBase}
            scale={scale}
          />
        </div>

        {/* Name panel: tiles (21,5)→(30,10), offset = rows 2-7, cols 22-31 */}
        <div style={{ gridColumn: '22 / 32', gridRow: '2 / 8' }}>
          <PauseNamePanel
            itemName={selectedItemName}
            spritesBase={spritesBase}
            scale={scale}
          />
        </div>

        {/* Progress panel: tiles (21,11)→(30,19), offset = rows 8-16, cols 22-31 */}
        <div style={{ gridColumn: '22 / 32', gridRow: '8 / 17' }}>
          <PauseProgressPanel
            pendants={data.pendants}
            crystals={data.crystals}
            showCrystals={data.showCrystals}
            spritesBase={spritesBase}
            scale={scale}
          />
        </div>

        {/* Abilities panel: tiles (1,21)→(19,29), offset = rows 18-26, cols 2-20 */}
        <div style={{ gridColumn: '2 / 21', gridRow: '18 / 27' }}>
          <PauseAbilitiesPanel
            gloves={data.gloves}
            boots={data.boots}
            flippers={data.flippers}
            moonPearl={data.moonPearl}
            abilityFlags={0}
            spritesBase={spritesBase}
            scale={scale}
          />
        </div>

        {/* Equipment panel: tiles (21,21)→(30,29), offset = rows 18-26, cols 22-31 */}
        <div style={{ gridColumn: '22 / 32', gridRow: '18 / 27' }}>
          <PauseEquipmentPanel
            sword={data.sword}
            shield={data.shield}
            armor={data.armor}
            spritesBase={spritesBase}
            scale={scale}
          />
        </div>
      </div>
    </div>
  );
}

export { PauseMenuView, GRID_TO_SAVE, GRID_SLOT_NAMES, getItemNameForSlot };
