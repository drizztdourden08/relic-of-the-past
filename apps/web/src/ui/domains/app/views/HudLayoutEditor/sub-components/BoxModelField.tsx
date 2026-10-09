/* @layer renderer-components @kind component */
import { useState } from 'react';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Field } from '@ds/primitives/Field';
import { Text } from '@ds/primitives/Text';
import { NumberCell } from './NumberCell';
import { compactEdges } from '../behavior/offset';
import { OFFSET_SIDES, SIDES } from './BoxModelField.constants';
import type { Edges } from '@shared/types/hud';
import type { BoxModelFieldProps, Side } from './BoxModelField.type';

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

export { BoxModelField };
export type { BoxModelFieldProps } from './BoxModelField.type';
