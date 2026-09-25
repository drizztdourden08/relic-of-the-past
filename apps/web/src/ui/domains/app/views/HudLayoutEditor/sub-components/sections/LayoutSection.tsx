/* @layer renderer-components @kind component */
/**
 * FOUR SECTIONS, FLAT ON THE PANEL, AND EACH ONE IS EXACTLY ONE CONCERN (§58).
 * The maintainer, for the seventh time and in the only words that matter:
 *
 * > "THE FUCKING OPTIONS GO BY CONCERNS. NOTHING IN A FUCKING SECTION SHOULD
 * > CHANGE WHEN CLICKING ANY FUCKING OTHER OPTION IN THAT SAME FUCKING SECTION!
 * > [...] the flex should have a manipulation section as well. same principle"
 *
 * 1. **LAYOUT** holds Type · Gap `↔` `↕` · Overlay. Identical for EVERY container,
 *    whatever its type, since §57 made the model agree: both engines store
 *    `gap: { x, y }` and `guide` is any container's. Pressing Type changes which
 *    button is lit and nothing else here.
 * 2. **FLOW** is direction and wrap, flex only. A SECTION OF ITS OWN precisely
 *    BECAUSE `direction` turns the alignment diagrams: that makes the tiles a
 *    LATER section reacting to an earlier one, which the rule allows, instead of
 *    six tiles rotating inside the section that was just pressed.
 * 3. **ALIGNMENT** is the tiles. Pressing one tile writes one key and lights one
 *    tile; no other tile in the section changes.
 * 4. **GRID MANIPULATION / FLEX MANIPULATION** is the container's own STRUCTURE.
 *    A grid's structure is its tracks; a flex container's is the ORDER of its
 *    children, each child its own track. Same principle, same three bands
 *    (contextual strip · drawing · legend), same "a press writes nothing".
 *
 * THIS FILE IS STILL WHERE THE TWO ENGINES ARE TRANSLATED INTO ONE SHAPE, and
 * there is less to translate every pass: section one needs none at all now, and
 * what is left is the alignment rows and which manipulation component to mount
 * (`behavior/layout-sides.ts`).
 *
 * IT IS THE COMPONENT THAT READS THE VIEW STORE for the overlay flag, which is editor
 * state, never the document's.
 */
import { Box } from '@ds/primitives/Box';
import { useHudEditorViewStore } from '@app/stores/hud-editor-view-store';
import { AlignmentTiles } from '../AlignmentTiles';
import { FlexEditor } from '../FlexEditor';
import { FlowSettings } from '../FlowSettings';
import { GridEditor } from '../GridEditor';
import { DEFAULT_GUIDE, LayoutSettings } from '../LayoutSettings';
import { SubSection } from '../SubSection';
import {
  flexAlignRows, gapCellsOf, gridAlignRows,
} from '../../behavior/layout-sides';
import { engineSwitchPatch } from '@shared/hud/layouts/convert-engine';
import type { DropIntent } from '../../behavior/drop-intent';
import type { HudContainer, HudFlexContainer, HudGridContainer } from '@shared/types/hud';

interface LayoutSectionProps {
  node: HudContainer;
  /** The manipulation components write THIS container and nothing else (§50):
   *  a grid's tracks, a flex container's child order. A child's own cell is
   *  that child's Placement section's business. */
  onPatch: (patch: Partial<HudContainer>) => void;
  /** THE ONE DOOR A REORDER GOES THROUGH (§58). A flex container's structure is
   *  its children's order, and moving a node is `applyDrop`'s job in this
   *  editor. There is one writer, and a grep test that says so. Absent in a harness
   *  that mounts the section without the View, where the strip is read-only. */
  onDrop?: (ids: readonly string[], intent: DropIntent) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
}

const LayoutSection = (props: LayoutSectionProps) => {
  const { node, onPatch, onDrop, scope, insideRepeat } = props;
  const overlayOn = useHudEditorViewStore((s) => s.gridOverlayEnabled);
  const toggleOverlay = useHudEditorViewStore((s) => s.toggleGridOverlay);
  const isGrid = node.layout === 'grid';

  // A CONVERSION, not a fresh container handed to a merging patch: that left the
  // other engine's keys behind and crashed the layout pass (`convert-engine.ts`).
  const setEngine = (next: string): void => {
    const patch = engineSwitchPatch(node, next === 'grid' ? 'grid' : 'flex');
    if (patch) onPatch(patch as Partial<HudContainer>);
  };

  const grid = node as HudGridContainer;
  const flex = node as HudFlexContainer;
  const patchGrid = onPatch as (patch: Partial<HudGridContainer>) => void;
  const patchFlex = onPatch as (patch: Partial<HudFlexContainer>) => void;

  return (
    <Box className="hud-inspect__group hud-layout-sections">
      <LayoutSettings
        engine={isGrid ? 'grid' : 'flex'}
        onSetEngine={setEngine}
        overlay={{
          guide: node.guide?.color ?? DEFAULT_GUIDE,
          onGuide: (color) => onPatch({ guide: { show: node.guide?.show ?? true, color } }),
          overlayOn,
          onToggleOverlay: toggleOverlay,
        }}
        gap={gapCellsOf(node)}
        // BOTH AXES, BOTH ENGINES (§57). One cell writes one axis and leaves the
        // other's stored value alone, which is the same rule a tile follows.
        onGap={(axis, next) => onPatch({ gap: { ...node.gap, [axis]: next } })}
        scope={scope}
        insideRepeat={insideRepeat}
      />

      {!isGrid && (
        <FlowSettings
          direction={flex.direction}
          onDirection={(direction) => patchFlex({ direction })}
          wrap={flex.wrap === true}
          onWrap={(next) => patchFlex({ wrap: next ? true : undefined })}
        />
      )}

      <SubSection title="Alignment">
        <AlignmentTiles
          direction={isGrid ? 'row' : flex.direction}
          rows={isGrid ? gridAlignRows(grid, patchGrid) : flexAlignRows(flex, patchFlex)}
        />
      </SubSection>

      <SubSection title={isGrid ? 'Grid manipulation' : 'Flex manipulation'}>
        {isGrid
          ? <GridEditor container={grid} onPatchContainer={patchGrid} />
          : <FlexEditor container={flex} onDrop={onDrop} />}
      </SubSection>
    </Box>
  );
};

export { LayoutSection };
export type { LayoutSectionProps };
