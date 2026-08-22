/* @layer renderer-hud @kind component */
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

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { HudBox } from '../../primitives/HudBox';
import { usePauseMenu } from '../../hooks/usePauseMenu';
import { PauseItemGrid } from '../../compounds/PauseItemGrid';
import { PauseNamePanel } from '../../compounds/PauseNamePanel';
import { PauseProgressPanel } from '../../compounds/PauseProgressPanel';
import { PauseAbilitiesPanel } from '../../compounds/PauseAbilitiesPanel';
import { PauseEquipmentPanel } from '../../compounds/PauseEquipmentPanel';
import { PauseBottlePanel } from '../../compounds/PauseBottlePanel';
import { getSlotSprite } from '../../composites/PauseItemSlot';
import { useLocalizedNames } from './behavior/useLocalizedNames';
import { itemNameKeyForSlot } from './behavior/item-name-key';
import { wrapName } from './behavior/wrap-name';

/** Standard SNES menu content area */
const MENU_H = 224;

/**
 * Grid slot → save RAM index (kHudItemToItemOrg from hud.c).
 * Maps the pause menu cursor position to the inventory save data index.
 * Used for cursor navigation logic, NOT for visual display order.
 */
const GRID_TO_SAVE = [0, 3, 2, 14, 1, 10, 5, 6, 15, 16, 17, 9, 4, 8, 7, 12, 11, 18, 13, 19];

const PauseMenuView = ({ slideTransform, slideTransition }: { slideTransform?: string; slideTransition?: string } = {}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const computeLayout = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const h = el.clientHeight;
    if (h <= 0) return;

    const canvas = document.getElementById('canvas') as HTMLCanvasElement | null;
    // Canvas buffer is always 2× native (448 for 224-line, 480 for 240-line extendY)
    const nativeH = canvas ? canvas.height / 2 : MENU_H;

    // Scale to match the game's pixel size (respects extendY 240-line mode)
    setScale(h / nativeH);
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

  // Build display items array — replace bottle slot with actual bottle content
  const displayItems = [...data.items];
  if (displayItems[15] > 0) {
    displayItems[15] = data.bottles[displayItems[15] - 1] ?? 0;
  }

  const selectedSaveIdx = data.equippedY > 0 ? data.equippedY - 1 : -1;
  const isBottleSelected = selectedSaveIdx === 15 && data.items[15] > 0;

  // Bottle panel expand/collapse animation (~300ms, matching SNES 18-frame expand)
  const [bottlePhase, setBottlePhase] = useState<'hidden' | 'expanding' | 'visible' | 'collapsing'>('hidden');
  const prevBottleRef = useRef(false);
  useEffect(() => {
    if (isBottleSelected && !prevBottleRef.current) {
      setBottlePhase('expanding');
    } else if (!isBottleSelected && prevBottleRef.current) {
      setBottlePhase('collapsing');
    }
    prevBottleRef.current = isBottleSelected;
  }, [isBottleSelected]);

  const showBottlePanel = bottlePhase !== 'hidden';
  const showNormalPanels = bottlePhase === 'hidden';

  const bottlePanelStyle: React.CSSProperties = bottlePhase === 'expanding'
    ? { animation: 'bottle-panel-expand 300ms steps(18) forwards' }
    : bottlePhase === 'collapsing'
    ? { animation: 'bottle-panel-collapse 300ms steps(18) forwards' }
    : {};

  const handleBottleAnimEnd = useCallback(() => {
    if (bottlePhase === 'expanding') setBottlePhase('visible');
    else if (bottlePhase === 'collapsing') setBottlePhase('hidden');
  }, [bottlePhase]);

  // Names come from the active profile's language set (English defaults behind it),
  // then get folded to drawable glyphs and wrapped onto the panel's column grid.
  const { itemName, bottleName } = useLocalizedNames();
  const selectedItemName = useMemo(() => {
    if (isBottleSelected) return bottleName(data.bottles[data.items[15] - 1] ?? 0);
    const key = itemNameKeyForSlot(selectedSaveIdx, data.items);
    return key ? itemName(key.recordId, key.tier) : '';
  }, [isBottleSelected, bottleName, itemName, data.bottles, data.items, selectedSaveIdx]);
  const selectedNameLines = useMemo(() => wrapName(selectedItemName), [selectedItemName]);

  // Get the selected item's sprite for the name panel
  const selectedItemSprite = selectedSaveIdx >= 0
    ? getSlotSprite(selectedSaveIdx, isBottleSelected ? (data.bottles[data.items[15] - 1] ?? 0) : (data.items[selectedSaveIdx] ?? 0)) : null;

  // Derive ability flags from equipment/items as fallback when WASM hasn't exported them yet.
  // Real link_ability_flags (byte 81) will be non-zero once WASM is rebuilt.
  const derivedAbilityFlags = data.abilityFlags || (
    (data.gloves > 0 ? 0x80 : 0) |    // bit 7: LIFT
    (data.items[14] > 0 ? 0x40 : 0) |  // bit 6: READ (book of mudora)
    (data.items[14] > 0 ? 0x20 : 0) |  // bit 5: TALK (book grants this too)
    0x08 |                               // bit 3: PULL (always available)
    (data.boots > 0 ? 0x04 : 0) |      // bit 2: RUN
    (data.flippers > 0 ? 0x02 : 0)     // bit 1: SWIM
  );

  const tile = 8 * scale;

  // CSS Grid: 32 columns × 28 rows (each cell = 1 SNES tile).
  // BG3 scroll offset: tile row 5 in BG space = visual row 2 (offset = 3 tiles).
  return (
    <HudBox
      ref={containerRef}
      className="pause-menu"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        transform: slideTransform,
        transition: slideTransition,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <HudBox className="pause-grid" style={{
        display: 'grid',
        gridTemplateColumns: `repeat(32, ${tile}px)`,
        gridTemplateRows: `repeat(28, ${tile}px)`,
      }}>
      {/* Items panel: tiles (1,5)→(19,19), offset -3 = rows 2-16, cols 2-20 */}
      <PauseItemGrid
        items={displayItems}
        selectedIndex={selectedSaveIdx}
        staticSelection={isBottleSelected}
        spritesBase={spritesBase}
        scale={scale}
        style={{ gridColumn: '2 / 21', gridRow: '2 / 17' }}
      />

      {/* Name panel: tiles (21,5)→(30,10), offset = rows 2-7, cols 22-31 */}
      <PauseNamePanel
        itemName={selectedNameLines}
        itemSprite={selectedItemSprite}
        borderColor={showBottlePanel ? 'yellow' : 'green'}
        spritesBase={spritesBase}
        scale={scale}
        style={{ gridColumn: '22 / 32', gridRow: '2 / 8' }}
      />

      {/* Right side: bottle panel when on bottle slot, otherwise progress + equipment */}
      {showBottlePanel && (
        <HudBox
          style={{ gridColumn: '22 / 32', gridRow: '8 / 27', ...bottlePanelStyle }}
          onAnimationEnd={handleBottleAnimEnd}
        >
          <PauseBottlePanel
            bottles={data.bottles}
            selectedIndex={data.items[15] - 1}
            scale={scale}
            spritesBase={spritesBase}
          />
        </HudBox>
      )}
      {showNormalPanels && (
        <>
          {/* Progress panel: tiles (21,11)→(30,19), offset = rows 8-16, cols 22-31 */}
          <PauseProgressPanel
            pendants={data.pendants}
            crystals={data.crystals}
            showCrystals={data.showCrystals}
            spritesBase={spritesBase}
            scale={scale}
            style={{ gridColumn: '22 / 32', gridRow: '8 / 17' }}
          />

          {/* Equipment panel: tiles (21,21)→(30,29), offset = rows 18-26, cols 22-31 */}
          <PauseEquipmentPanel
            sword={data.sword}
            shield={data.shield}
            armor={data.armor}
            heartPieces={data.heartPieces}
            isInDungeon={data.isInDungeon}
            bigKeys={data.bigKeys}
            maps={data.maps}
            compasses={data.compasses}
            palaceIndex={data.palaceIndex}
            spritesBase={spritesBase}
            scale={scale}
            style={{ gridColumn: '22 / 32', gridRow: '18 / 27' }}
          />
        </>
      )}

      {/* Abilities panel: tiles (1,21)→(19,29), offset = rows 18-26, cols 2-20 */}
      <PauseAbilitiesPanel
        gloves={data.gloves}
        boots={data.boots}
        flippers={data.flippers}
        moonPearl={data.moonPearl}
        abilityFlags={derivedAbilityFlags}
        spritesBase={spritesBase}
        scale={scale}
        style={{ gridColumn: '2 / 21', gridRow: '18 / 27' }}
      />
      </HudBox>
    </HudBox>
  );
};

export { PauseMenuView, GRID_TO_SAVE };
