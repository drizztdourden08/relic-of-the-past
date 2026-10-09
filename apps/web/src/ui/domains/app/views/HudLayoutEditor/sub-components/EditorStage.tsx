/* @layer renderer-components @kind component */
import { useEffect, useRef, useState } from 'react';
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import { HudNodeRenderer } from '@domains/hud/compounds/HudNodeRenderer';
import { ContainerOverlay } from './ContainerOverlay';
import { StageFlexEcho } from './StageFlexEcho';
import { StageGridEcho } from './StageGridEcho';
import { StageSelection } from './StageSelection';
import { useMotionPreview } from '../behavior/motion-preview';
import { GROUND_TILE } from '../HudLayoutEditor.constants';
import { TILE } from './EditorStage.constants';
import type { HudContainer } from '@shared/types/hud';
import type { PlacedNode } from '@shared/hud/engine';
import type { EditorStageProps } from './EditorStage.type';

const isContainer = (node: PlacedNode['node'] | undefined): node is HudContainer =>
  !!node && node.kind === 'container';

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
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const preview = useMotionPreview();

  useEffect(() => {
    const element = stageRef.current;
    if (!element) return;
    const measure = (): void => {
      const width = element.clientWidth;
      if (width > 0) setScale(width / sample.view.w);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [sample.view.w]);

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
export type { EditorStageProps } from './EditorStage.type';
