/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { useHudEditorViewStore } from '@app/stores/hud-editor-view-store';
import { AlignmentTiles } from './AlignmentTiles';
import { FlexEditor } from './FlexEditor';
import { FlowSettings } from './FlowSettings';
import { GridEditor } from './GridEditor';
import { LayoutSettings } from './LayoutSettings';
import { DEFAULT_GUIDE } from './LayoutSettings.constants';
import { SubSection } from './SubSection';
import {
  flexAlignRows, gapCellsOf, gridAlignRows,
} from '@app/hud-layout-editing/layout-sides';
import { engineSwitchPatch } from '@rotp/hud';
import type { HudFlexContainer, HudGridContainer } from '@rotp/hud';
import type { LayoutSectionProps } from './LayoutSection.type';

const LayoutSection = (props: LayoutSectionProps) => {
  const { node, onPatch, onDrop, scope, insideRepeat } = props;
  const overlayOn = useHudEditorViewStore((s) => s.gridOverlayEnabled);
  const toggleOverlay = useHudEditorViewStore((s) => s.toggleGridOverlay);
  const isGrid = node.layout === 'grid';

  const setEngine = (next: string): void => {
    const patch = engineSwitchPatch(node, next === 'grid' ? 'grid' : 'flex');
    if (patch) onPatch(patch);
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
