/* @layer renderer-components @kind component */
/**
 * The stage is the play field, at true scale, over a real ground.
 *
 * "True scale" means the stage IS the play field: its aspect is the ratio being
 * judged, one game pixel is one stage unit, and every element is drawn by the
 * component that will draw it in game. That is the same `HudNodeRenderer`, over the
 * same solved tree, from the same engine. What is previewed here is literally
 * what will be seen, with no stand-in boxes and no second copy of the
 * arrangement.
 *
 * THE GROUND IS TILED BEHIND IT, and it earns its place: two defects in one
 * week were "invisible against the background it was actually drawn on". A flat
 * panel colour cannot show that; grass and a dark floor can.
 *
 * The grid is one tile of 8 game pixels because that is the unit the game is
 * built from. Picking and selection are a layer of their own over the art, so
 * the art itself is untouched by the editor.
 *
 * NOTHING IS DRAGGED HERE (§47). The stage had a margin nudge and a corner
 * scale handle; both are gone, and with the nudge went this component's local
 * preview of it. There is no longer any state on this surface that the solved
 * tree does not already carry, so what the engine placed is drawn verbatim.
 */
import { useEffect, useRef, useState } from 'react';
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import { HudNodeRenderer } from '@domains/hud/compounds/HudNodeRenderer';
import { ContainerOverlay } from './ContainerOverlay';
import { StageFlexEcho, StageGridEcho } from './StageGridEcho';
import { StageSelection } from './StageSelection';
import { useMotionPreview } from '../behavior/motion-preview';
import { GROUND_TILE } from '../HudLayoutEditor.constants';
import type { EditorSampleState } from '../behavior/useSampleState.type';
import type { HudContainer } from '@shared/types/hud';
import type { PlacedNode } from '@shared/hud/engine';

/** The game's own unit, and the grid the stage draws. */
const TILE = 8;

const isContainer = (node: PlacedNode['node'] | undefined): node is HudContainer =>
  !!node && node.kind === 'container';

/** The container the overlay draws for is the selected node itself when it IS a
 *  container of EITHER engine (§57), or its own real parent when the selected
 *  node is one of that container's children, so a selected child is seen in the
 *  arrangement that put it there. `placed` is already past `expand.ts`, so
 *  "parent" here is whichever container's own `children` names the id, with
 *  no repeat/switch to skip through any more. */
const overlayTargetFor = (placed: readonly PlacedNode[], selectedId: string | null): HudContainer | null => {
  const selected = placed.find((p) => p.id === selectedId)?.node;
  if (isContainer(selected)) return selected;
  const parent = placed.find((p) => p.node.kind === 'container' && p.node.children.some((c) => c.id === selectedId))?.node;
  return isContainer(parent) ? parent : null;
};

interface EditorStageProps {
  placed: readonly PlacedNode[];
  sample: EditorSampleState;
  /** Filename of the ground block to tile, or empty for a plain field. */
  ground: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const EditorStage = (props: EditorStageProps) => {
  const {
    placed, sample, ground, selectedId, onSelect,
  } = props;
  const overlayTarget = overlayTargetFor(placed, selectedId);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  // Motion's scrub/play head, when the author has taken hold of it. `null`
  // until they do, which is the stage running its own clock exactly as before
  // - the transport is an override, never a second clock (see
  // `behavior/motion-preview.ts`).
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
export type { EditorStageProps };
