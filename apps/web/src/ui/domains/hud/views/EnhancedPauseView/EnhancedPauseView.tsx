/* @layer renderer-hud @kind component */
import { useMemo } from 'react';
import { hudDataScope } from '@shared/hud/data';
import { AUTO_PACK_ID } from '@shared/input/glyphs';
import { useControlSchemeStore } from '@app/stores/control-scheme-store';
import { useHudLayoutStore } from '@app/stores/hud-layout-store';
import { useHudSettingsStore } from '@app/stores/hud-settings-store';
import { usePauseMenuStore } from '@app/stores/pause-menu-store';
import { HudBox } from '../../primitives/HudBox';
import { HudNodeRenderer } from '../../compounds/HudNodeRenderer';
import { PauseScreenTabs } from '../../composites/PauseScreenTabs';
import { PauseNavLegend } from '../../compounds/PauseNavLegend';
import { useHud } from '../../hooks/useHud';
import { usePauseMenu } from '../../hooks/usePauseMenu';
import { useHudViewport } from '../HudLayoutView/behavior/useHudViewport';
import { usePlacedLayout } from '../HudLayoutView/behavior/usePlacedLayout';
import { useSlotContent } from '../HudLayoutView/behavior/useSlotContent';
import { useVitalsContent } from '../HudLayoutView/behavior/useVitalsContent';
import { useGearModel } from './behavior/useGearModel';
import { useItemModel } from './behavior/useItemModel';
import { useLegendEntries } from './behavior/useLegendEntries';
import { usePauseAssign } from './behavior/usePauseAssign';
import { usePauseCursor } from './behavior/usePauseCursor';
import { useStatusModel } from './behavior/useStatusModel';
import { useVisibleBrowsing } from './behavior/useVisibleBrowsing';
import { PauseHeroLayer } from './sub-components/PauseHeroLayer';
import { PauseScreenHost } from './sub-components/PauseScreenHost';
import {
  CLUSTER_INSET, CLUSTER_TOP, MENU_INSET, SCREEN_TABS, SCREEN_Y, TABS_X, TABS_Y,
} from './EnhancedPauseView.constants';
import type { ItemsSection } from '../../compounds/PauseItemsScreen';
import type { EnhancedPauseViewProps } from './EnhancedPauseView.type';

const EnhancedPauseView = (props: EnhancedPauseViewProps = {}) => {
  const { slideTransform, slideTransition } = props;

  const { containerRef, scale, view } = useHudViewport();
  const state = usePauseMenuStore((s) => s.state);
  const open = usePauseMenuStore((s) => s.open);
  const canConfirm = usePauseMenuStore((s) => s.canConfirm);
  const layout = useHudLayoutStore((s) => s.layout);
  const bindings = useControlSchemeStore((s) => s.bindings);
  const heartMode = useHudSettingsStore((s) => s.heartMode);
  const { data, config } = usePauseMenu(scale);
  const { data: hud } = useHud(scale);
  const packId = layout.glyphPack ?? AUTO_PACK_ID;
  const slots = useSlotContent(packId);
  const { vitals: nodeVitals, hearts, spritesBase: hudSprites } = useVitalsContent(scale);

  const visible = useVisibleBrowsing(state, canConfirm);
  const { screen, section, cursor } = visible;
  const itemsSection: ItemsSection = section === 'bottles' ? 'bottles' : 'items';

  const items = useItemModel(itemsSection, cursor);
  const gear = useGearModel();
  const dungeonItems = useStatusModel();
  const { assign, hintLines } = usePauseAssign(screen, section);
  const move = usePauseCursor();
  const legend = useLegendEntries(bindings, packId, visible.canConfirm);

  const slotCount = Object.keys(slots.slots).length;
  const dataScope = useMemo(() => hudDataScope(nodeVitals, slotCount), [nodeVitals, slotCount]);
  const ctx = useMemo(
    () => ({ hearts, filledSlots: slots.filledSlots, scope: dataScope }),
    [dataScope, hearts, slots.filledSlots],
  );
  const placed = usePlacedLayout(layout, view, ctx);
  const content = useMemo(
    () => ({ vitals: nodeVitals, slots: slots.slots, glyph: slots.glyph }),
    [nodeVitals, slots.glyph, slots.slots],
  );

  const px = (n: number): number => n * scale;
  const spritesBase = config.spritesBase;

  const vitals = {
    healthCurrent: hud.healthCurrent,
    healthCapacity: hud.healthCapacity,
    armor: data.armor,
    magic: hud.magicPower,
    halfMagic: hud.halfMagic,
    heartPieces: data.heartPieces,
    pendants: data.pendants,
    crystals: data.crystals,
  };

  return (
    <HudBox
      ref={containerRef}
      className="enhanced-pause"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: open ? 'auto' : 'none',
        transform: slideTransform,
        transition: slideTransition,
      }}
    >
      <PauseHeroLayer
        active={open}
        scale={scale}
        counterTransform={open || !slideTransform ? 'translateY(0)' : `translateY(${view.h * scale}px)`}
        transition={slideTransition ?? 'none'}
      />

      {open && (
        <>
          <HudBox
            className="enhanced-pause__plate"
            style={{ position: 'absolute', left: px(TABS_X), top: px(TABS_Y) }}
          >
            <PauseScreenTabs
              tabs={SCREEN_TABS}
              active={screen}
              scale={scale}
              spritesBase={spritesBase}
              onSelect={move.selectScreen}
            />
          </HudBox>

          <HudBox
            className="enhanced-pause__screen"
            style={{ position: 'absolute', left: px(MENU_INSET), top: px(SCREEN_Y) }}
          >
            <PauseScreenHost
              screen={screen}
              section={section}
              cursor={cursor}
              items={items}
              gear={gear}
              dungeonItems={dungeonItems}
              vitals={vitals}
              heartMode={heartMode}
              hintLines={hintLines}
              scale={scale}
              spritesBase={spritesBase}
              onFocus={move.focus}
              onConfirm={move.confirm}
            />
          </HudBox>

          {placed.bounds && (
            <HudBox
              style={{
                position: 'absolute',
                right: px(CLUSTER_INSET),
                top: px(CLUSTER_TOP),
                width: px(placed.bounds.w),
                height: px(placed.bounds.h),
              }}
            >
              <HudNodeRenderer
                nodes={placed.buttons}
                scale={scale}
                content={content}
                spritesBase={hudSprites}
                origin={placed.bounds}
                onSlotPress={assign}
                dataScope={dataScope}
              />
            </HudBox>
          )}

          <HudBox style={{ position: 'absolute', left: 0, bottom: 0 }}>
            <PauseNavLegend entries={legend} width={view.w} scale={scale} spritesBase={spritesBase} />
          </HudBox>
        </>
      )}
    </HudBox>
  );
};

export { EnhancedPauseView };
