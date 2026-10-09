/* @layer renderer-hud @kind component */
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { CSSProperties } from 'react';
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
import { MENU_H } from './PauseMenuView.constants';

const PauseMenuView = ({ slideTransform, slideTransition }: { slideTransform?: string; slideTransition?: string } = {}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const computeLayout = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const h = el.clientHeight;
    if (h <= 0) return;

    const canvas = document.getElementById('canvas') as HTMLCanvasElement | null;
    const nativeH = canvas ? canvas.height / 2 : MENU_H;

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

  const displayItems = [...data.items];
  if (displayItems[15] > 0) {
    displayItems[15] = data.bottles[displayItems[15] - 1] ?? 0;
  }

  const selectedSaveIdx = data.equippedY > 0 ? data.equippedY - 1 : -1;
  const isBottleSelected = selectedSaveIdx === 15 && data.items[15] > 0;

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

  const bottlePanelStyle: CSSProperties = bottlePhase === 'expanding'
    ? { animation: 'bottle-panel-expand 300ms steps(18) forwards' }
    : bottlePhase === 'collapsing'
    ? { animation: 'bottle-panel-collapse 300ms steps(18) forwards' }
    : {};

  const handleBottleAnimEnd = useCallback(() => {
    if (bottlePhase === 'expanding') setBottlePhase('visible');
    else if (bottlePhase === 'collapsing') setBottlePhase('hidden');
  }, [bottlePhase]);

  const { itemName, bottleName } = useLocalizedNames();
  const selectedItemName = useMemo(() => {
    if (isBottleSelected) return bottleName(data.bottles[data.items[15] - 1] ?? 0);
    const key = itemNameKeyForSlot(selectedSaveIdx, data.items);
    return key ? itemName(key.recordId, key.tier) : '';
  }, [isBottleSelected, bottleName, itemName, data.bottles, data.items, selectedSaveIdx]);
  const selectedNameLines = useMemo(() => wrapName(selectedItemName), [selectedItemName]);

  const selectedItemSprite = selectedSaveIdx >= 0
    ? getSlotSprite(selectedSaveIdx, isBottleSelected ? (data.bottles[data.items[15] - 1] ?? 0) : (data.items[selectedSaveIdx] ?? 0)) : null;

  const derivedAbilityFlags = data.abilityFlags || (
    (data.gloves > 0 ? 0x80 : 0) |
    (data.items[14] > 0 ? 0x40 : 0) |
    (data.items[14] > 0 ? 0x20 : 0) |
    0x08 |
    (data.boots > 0 ? 0x04 : 0) |
    (data.flippers > 0 ? 0x02 : 0)
  );

  const tile = 8 * scale;

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
      <PauseItemGrid
        items={displayItems}
        selectedIndex={selectedSaveIdx}
        staticSelection={isBottleSelected}
        spritesBase={spritesBase}
        scale={scale}
        style={{ gridColumn: '2 / 21', gridRow: '2 / 17' }}
      />

      <PauseNamePanel
        itemName={selectedNameLines}
        itemSprite={selectedItemSprite}
        borderColor={showBottlePanel ? 'yellow' : 'green'}
        spritesBase={spritesBase}
        scale={scale}
        style={{ gridColumn: '22 / 32', gridRow: '2 / 8' }}
      />

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
          <PauseProgressPanel
            pendants={data.pendants}
            crystals={data.crystals}
            showCrystals={data.showCrystals}
            spritesBase={spritesBase}
            scale={scale}
            style={{ gridColumn: '22 / 32', gridRow: '8 / 17' }}
          />

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

export { PauseMenuView };
