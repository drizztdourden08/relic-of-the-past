/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import type { LatticeOccupantsProps } from './LatticeOccupants.type';

const LatticeOccupants = (props: LatticeOccupantsProps) => {
  const { occupants, activeChildId } = props;

  return (
    <>
      {occupants.map((occupant) => (
        <Text
          key={occupant.id}
          className="hud-lattice__occupant"
          aria-hidden="true"
          data-active={occupant.id === activeChildId ? 'true' : undefined}
          style={{
            gridColumn: `${occupant.column + 1} / span ${occupant.colSpan}`,
            gridRow: `${occupant.row + 1} / span ${occupant.rowSpan}`,
          }}
        >
          {occupant.id}
        </Text>
      ))}
    </>
  );
};

export { LatticeOccupants };
