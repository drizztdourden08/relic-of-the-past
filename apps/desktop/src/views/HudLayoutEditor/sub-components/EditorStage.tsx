/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { HudNodeRenderer } from '@app/compounds/HudNodeRenderer';
import { ContainerOverlay } from './ContainerOverlay';
import { StageFlexEcho } from './StageFlexEcho';
import { StageGridEcho } from './StageGridEcho';
import { StageSelection } from './StageSelection';
import { useMotionPreview } from '@app/hud-layout-editing/motion-preview';
import { useStageScale } from '@app/hud-layout-editing/useStageScale';
import { GROUND_TILE } from '../HudLayoutEditor.constants';
import { TILE } from './EditorStage.constants';
import type { HudContainer, PlacedNode } from '@rotp/hud';
import type { EditorStageProps } from './EditorStage.type';

const isContainer = (node: PlacedNode['node'] | undefined): node is HudContainer =>
  node?.kind === 'container';

const overlayTargetFor = (placed: readonly PlacedNode[], selectedId: string | null): HudContainer | null => {
  const selected = placed.find((p) => p.id === selectedId)?.node;
  if (isContainer(selected)) return selected;
  const parent = placed.find((p) => p.node.kind === 'container' && p.node.children.some((c) => c.id === selectedId))?.node;
  return isContainer(parent) ? parent : null;
};

const EditorStage = (props: EditorStageProps) => {
  const {
    placed, sample, ground, selectedId, onSelect,
  } = props;
  const overlayTarget = overlayTargetFor(placed, selectedId);
  const { stageRef, scale } = useStageScale(sample.view.w);
  const preview = useMotionPreview();

  const tile = GROUND_TILE * scale;

  return (
    <Box
      ref={stageRef}
      className="hud-editor-stage"
      style={{ aspectRatio: `${sample.view.w} / ${sample.view.h}` }}
      onPointerDown={() => onSelect(null)}
    >
      {ground && (
        <Box
          className="hud-editor-stage__ground"
          style={{
            backgroundImage: `url("${sample.spritesBase}${ground}.png")`,
            backgroundSize: `${tile}px ${tile}px`,
          }}
        />
      )}
      <Box
        className="hud-editor-stage__grid"
        style={{ backgroundSize: `${TILE * scale}px ${TILE * scale}px` }}
      />
      <HudNodeRenderer
        nodes={placed}
        scale={scale}
        content={sample.content}
        spritesBase={sample.spritesBase}
        dataScope={sample.dataScope}
        clockOverrideMs={preview?.nowMs ?? null}
      />
      {overlayTarget && (
        <ContainerOverlay
          container={overlayTarget}
          placed={placed}
          scale={scale}
          ctx={{ hearts: sample.hearts, filledSlots: sample.filledSlots, scope: sample.dataScope }}
        />
      )}
      <StageGridEcho placed={placed} scale={scale} sample={sample} />
      <StageFlexEcho placed={placed} scale={scale} />
      <StageSelection
        nodes={placed}
        scale={scale}
        selectedId={selectedId}
        onSelect={onSelect}
      />
      <Text className="hud-editor-stage__stamp">sample content</Text>
    </Box>
  );
};

export { EditorStage };
