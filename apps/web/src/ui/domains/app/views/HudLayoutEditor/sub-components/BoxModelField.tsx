/* @layer renderer-components @kind component */
/**
 * THE BOX MODEL, DRAWN. Padding nests inside margin, with an editable number on
 * every edge and the box's own size in the middle.
 *
 * This is the single most conventional widget in the discipline and it was the
 * one thing here not built: since Firebug in 2006, every browser inspector,
 * Figma, Webflow, Unity's RectTransform and Blender's N-panel draw margin and
 * padding as nested rectangles. The nesting is what makes "which side is that"
 * free, and it is what buys each edge a legible cell. §35.6 measured the old
 * four-in-a-row spinners at 3 px of typing surface at the 188 px rail.
 *
 * LEFT AND TOP OF `margin` ARE DIMMED AND READ-ONLY, and this is the decision
 * the plan left open. Placement now edits those two numbers as the node's
 * OFFSET (`behavior/offset.ts`), so leaving them editable here would put two
 * competing editors for one pair of keys in two sections with no relationship
 * drawn between them. Showing them dimmed with a line saying where they live is
 * honest and asymmetric; hiding them would be neither, because the ring would
 * then be lying about what a margin is.
 *
 * ONLY PADDING GETS THE LINK. "All four the same" is an operation the margin
 * ring cannot perform any more, because two of its four edges belong to another
 * section. A chain on it would either write keys this control does not own
 * or silently do half a job. Padding owns all four of its edges and keeps it.
 */
import { useState } from 'react';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Field } from '@ds/primitives/Field';
import { Text } from '@ds/primitives/Text';
import { NumberCell } from './NumberCell';
import { compactEdges } from '../behavior/offset';
import type { Edges } from '@shared/types/hud';

type Side = keyof Edges;

const SIDES: readonly Side[] = ['top', 'right', 'bottom', 'left'];
/** Position owns these two, and they are the whole of a node's offset. */
const OFFSET_SIDES: readonly Side[] = ['left', 'top'];

interface BoxModelFieldProps {
  margin: Edges | undefined;
  padding: Edges | undefined;
  onMargin: (next: Edges | undefined) => void;
  onPadding: (next: Edges | undefined) => void;
  /** The authored size, read back into the middle cell (`80 x auto`). */
  centre: string;
  /** The screen root: its rectangle is the view, so no margin is authorable. */
  marginLocked?: boolean;
}

const edgeWith = (edges: Edges | undefined, side: Side, next: number | undefined): Edges | undefined => {
  const merged: Edges = { ...edges };
  if (next === undefined) delete merged[side]; else merged[side] = next;
  return compactEdges(merged);
};

const BoxModelField = (props: BoxModelFieldProps) => {
  const { margin, padding, onMargin, onPadding, centre, marginLocked = false } = props;
  const [linked, setLinked] = useState(false);

  const setPad = (side: Side, next: number | undefined): void => {
    if (!linked) { onPadding(edgeWith(padding, side, next)); return; }
    onPadding(next === undefined ? undefined : { top: next, right: next, bottom: next, left: next });
  };

  const readOnlyMargin = (side: Side): boolean => marginLocked || OFFSET_SIDES.includes(side);
  const marginNote = marginLocked
    ? 'The screen is always exactly the view, so it has no margin to give.'
    : 'left and top are this node\'s offset. They show here and are edited in Position.';

  return (
    <Field size="sm" label="box" hint={marginNote} className="hud-box-model">
      <Box className="hud-box-model__ring hud-box-model__ring--margin">
        <Text className="hud-box-model__tag">margin</Text>
        {SIDES.map((side) => (
          <NumberCell
            key={side}
            className={`hud-box-model__edge hud-box-model__edge--${side}`}
            label={`margin ${side}`}
            value={margin?.[side]}
            readOnly={readOnlyMargin(side)}
            title={readOnlyMargin(side) ? marginNote : undefined}
            onChange={(next) => onMargin(edgeWith(margin, side, next))}
          />
        ))}

        <Box className="hud-box-model__ring hud-box-model__ring--padding">
          <Text className="hud-box-model__tag">padding</Text>
          {SIDES.map((side) => (
            <NumberCell
              key={side}
              className={`hud-box-model__edge hud-box-model__edge--${side}`}
              label={`padding ${side}`}
              value={padding?.[side]}
              onChange={(next) => setPad(side, next)}
            />
          ))}
          <Text className="hud-box-model__centre">{centre}</Text>
        </Box>

        <Button
          variant="bare"
          className={`hud-box-model__link${linked ? ' is-on' : ''}`}
          aria-pressed={linked}
          aria-label="Link the four padding edges"
          title="Type one number into any padding edge and all four follow."
          onClick={() => setLinked((was) => !was)}
        >
          ⛓
        </Button>
      </Box>
    </Field>
  );
};

export { BoxModelField, edgeWith };
export type { BoxModelFieldProps };
