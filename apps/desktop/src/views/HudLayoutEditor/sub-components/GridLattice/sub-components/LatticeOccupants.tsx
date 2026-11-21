/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { nodeName } from '@app/hud-layout-editing/node-name';
import type { LatticeOccupantsProps } from './LatticeOccupants.type';
import { useT } from '@drizztdourden08/brock-react';

const LatticeOccupants = (props: LatticeOccupantsProps) => {
  const t = useT();
  const { occupants, activeChildId } = props;

  return (
    <>
      {occupants.map((occupant) => (
        <Text
          key={occupant.id}
          className="hud-cell-label hud-lattice__occupant"
          aria-hidden="true"
          data-active={occupant.id === activeChildId ? 'true' : undefined}
          style={{
            gridColumn: `${occupant.column + 1} / span ${occupant.colSpan}`,
            gridRow: `${occupant.row + 1} / span ${occupant.rowSpan}`,
          }}
        >
          {nodeName(occupant.id, t)}
        </Text>
      ))}
    </>
  );
};

export { LatticeOccupants };
