/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives/Box';
import { stageCellRects } from '../../behavior/stage-cells';
import { useHudEditorViewStore } from '@app/stores/hud-editor-view-store';
import { hull } from './behavior/hull';
import { DEFAULT_GUIDE } from './StageGridEcho.constants';
import '../GridEditor/HudLayoutEditor.grid.css';
import type { HudGridContainer } from '@shared/types/hud';
import type { PlacedNode } from '@shared/hud/engine';
import type { StageGridEchoProps } from './StageGridEcho.type';

const isGrid = (placed: PlacedNode): placed is PlacedNode & { node: HudGridContainer } =>
  placed.node.kind === 'container' && placed.node.layout === 'grid';

const StageGridEcho = (props: StageGridEchoProps) => {
  const { placed, scale, sample } = props;
  const echo = useHudEditorViewStore((s) => s.gridEcho);
  if (!echo) return null;
  const ctx = { hearts: sample.hearts, filledSlots: sample.filledSlots, scope: sample.dataScope };

  return (
    <>
      {placed.filter((p) => p.id === echo.containerId && isGrid(p)).map((host, instance) => {
        const container = host.node as HudGridContainer;
        const cells = stageCellRects(host, scale, ctx)
          .filter((cell) => cell.column >= echo.c0 && cell.column <= echo.c1
            && cell.row >= echo.r0 && cell.row <= echo.r1);
        if (cells.length === 0) return null;
        const rect = hull(cells.map((cell) => cell.rect));
        return (
          <Box
            key={instance}
            className="hud-grid-echo"
            aria-hidden="true"
            style={{
              left: rect.x,
              top: rect.y,
              width: rect.w,
              height: rect.h,
              borderColor: container.guide?.color ?? DEFAULT_GUIDE,
              background: `${container.guide?.color ?? DEFAULT_GUIDE}22`,
            }}
          />
        );
      })}
    </>
  );
};

export { StageGridEcho };
