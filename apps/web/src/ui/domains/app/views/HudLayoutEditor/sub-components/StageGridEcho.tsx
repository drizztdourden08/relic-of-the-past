/* @layer renderer-components @kind component */
/**
 * The stage's echo of whatever is selected in the grid editor, for "click a cell,
 * see it in the layout", and nothing else. `pointer-events: none` on the whole
 * layer is the load-bearing declaration: the surface this replaces was clickable,
 * and §46 took that away on purpose.
 *
 * GEOMETRY COMES FROM THE ENGINE'S SOLVE (through `stageCellRects`), NOT FROM
 * WHERE THE CHILDREN LANDED. The
 * overlay beside it infers its lines from the sorted edges of placed children, so
 * a column with no child in it has no rectangle. An empty cell is precisely
 * what an editor exists to point at. The solve says so itself: "A column with no
 * child in it still has a rectangle."
 *
 * A REPEAT'S INSTANCES ALL ECHO. Their expanded ids match the same authored
 * container, so the same cell lights up in every instance, which is truthful:
 * one template became N boxes.
 */
import { Box } from '@ds/primitives/Box';
import { stageCellRects } from '../behavior/stage-cells';
import { useHudEditorViewStore } from '@app/stores/hud-editor-view-store';
import './GridEditor/HudLayoutEditor.grid.css';
import type { EditorSampleState } from '../behavior/useSampleState.type';
import type { HudContainer, HudGridContainer } from '@shared/types/hud';
import type { PlacedNode } from '@shared/hud/engine';
import type { Rect } from '@shared/hud/layouts/geometry.type';

const DEFAULT_GUIDE = '#c064c0';

interface StageGridEchoProps {
  placed: readonly PlacedNode[];
  scale: number;
  sample: EditorSampleState;
}

const isGrid = (placed: PlacedNode): placed is PlacedNode & { node: HudGridContainer } =>
  placed.node.kind === 'container' && placed.node.layout === 'grid';

const hull = (rects: readonly Rect[]): Rect => {
  const x = Math.min(...rects.map((r) => r.x));
  const y = Math.min(...rects.map((r) => r.y));
  return {
    x,
    y,
    w: Math.max(...rects.map((r) => r.x + r.w)) - x,
    h: Math.max(...rects.map((r) => r.y + r.h)) - y,
  };
};

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

/**
 * THE SAME ECHO, FOR A FLEX CONTAINER'S PICKED CHILDREN (§58). There is nothing
 * to solve: a flex container has no empty cells to infer, so a child's own
 * placed rectangle IS the thing the strip pointed at (§57.5), which is why this
 * reads `placed` directly where the grid's half reads `stageCellRects`.
 *
 * A REPEAT'S INSTANCES ALL ECHO, by the same rule: every expanded copy whose
 * authored id was picked lights up, because one template really did become N
 * boxes.
 */
const StageFlexEcho = (props: { placed: readonly PlacedNode[]; scale: number }) => {
  const { placed, scale } = props;
  const echo = useHudEditorViewStore((s) => s.flexEcho);
  if (!echo || echo.childIds.length === 0) return null;
  const host = placed.find((node) => node.id === echo.containerId);
  const color = (host?.node as HudContainer | undefined)?.guide?.color ?? DEFAULT_GUIDE;
  const wanted = new Set(echo.childIds);

  return (
    <>
      {placed.filter((node) => wanted.has(node.id)).map((node, i) => (
        <Box
          key={i}
          className="hud-grid-echo"
          aria-hidden="true"
          style={{
            left: node.rect.x * scale,
            top: node.rect.y * scale,
            width: node.rect.w * scale,
            height: node.rect.h * scale,
            borderColor: color,
            background: `${color}22`,
          }}
        />
      ))}
    </>
  );
};

export { StageFlexEcho, StageGridEcho, hull };
export type { StageGridEchoProps };
