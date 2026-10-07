/* @layer renderer-components @kind component */
/**
 * The picking layer over the stage: one hit box per placed node, an outline
 * around the selected one, and a measured `W×H` badge.
 *
 * IT IS OVER THE ART, NEVER PART OF IT. Every rectangle here comes from the
 * engine, so what is clickable is exactly what was drawn; there is no second
 * measurement of anything, which is the drift the pause menu's old click
 * targets had against the cluster they covered.
 *
 * THE STAGE SELECTS, AND THAT IS THE WHOLE OF IT (§47). The maintainer, after
 * §46: *"I can still drag stuff on the full layout preview. I should be able to
 * select them but not drag them."* So there is no pointer gesture on this
 * surface at all any more. §37's margin nudge is gone, and so is the corner
 * scale handle, because a resize IS a drag and the sentence covers both.
 *
 * WHAT THAT COSTS IS NOTHING, BECAUSE BOTH EDITS HAVE TYPED HOMES. A node's
 * position is `margin.left`/`margin.top` and Placement's `OffsetField` writes
 * it through `behavior/offset.ts`; its `scale` is a `ValueInput` in Size & Box.
 * Both are keyboard-reachable, both say the number they wrote, and neither can
 * be fired by accident while aiming at something else. That is the failure
 * the nudge actually had: a 3 px margin written onto a box while picking it.
 *
 * A CLICK IS A CLICK, with nothing in front of it. There is no slop threshold
 * to pass, no arming step, and no "the selected box behaves differently" rule,
 * because there is no longer a second meaning for a press to be told apart
 * from. The press selects, on the way down, every time.
 *
 * THE SCREEN ROOT IS AN ORDINARY PICK NOW. It was excluded from the nudge
 * because `validate-layout.ts` refuses a margin on it; selecting it writes
 * nothing, so it needs no exclusion. It must stay pickable, since it is
 * how the screen's own Layout section is reached.
 */
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { PlacedNode } from '@shared/hud/engine';

interface StageSelectionProps {
  nodes: readonly PlacedNode[];
  /** Display pixels per game pixel. */
  scale: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const StageSelection = (props: StageSelectionProps) => {
  const { nodes, scale, selectedId, onSelect } = props;

  /** The stage's own press clears the selection (`EditorStage`), so a press
   *  that found a box must not also reach the ground under it. */
  const pick = (event: ReactPointerEvent, id: string): void => {
    event.stopPropagation();
    onSelect(id);
  };

  return (
    <Box className="hud-stage__picks">
      {nodes.map((placed) => {
        const selected = placed.id === selectedId;
        const style = {
          left: placed.rect.x * scale,
          top: placed.rect.y * scale,
          width: Math.max(1, placed.rect.w * scale),
          height: Math.max(1, placed.rect.h * scale),
        };
        return (
          <Box
            key={placed.id}
            className={`hud-stage__pick${selected ? ' is-selected' : ''}${placed.node.kind === 'container' ? ' is-container' : ''}`}
            // THE PLACED RECTANGLE, NAMED (§58). These boxes already ARE every
            // node's placed rect at the display scale, so naming them makes the
            // stage readable: `hud-layout-options.keep.spec.ts` asserts that a
            // gap really widened and a reorder really moved a child by reading
            // them, instead of settling for "the press did not throw".
            data-node-id={placed.id}
            style={style}
            onPointerDown={(event) => pick(event, placed.id)}
          >
            {selected && (
              <Text className="hud-stage__measured">{Math.round(placed.rect.w)}×{Math.round(placed.rect.h)}</Text>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export { StageSelection };
export type { StageSelectionProps };
