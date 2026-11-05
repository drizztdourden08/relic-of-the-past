/* @layer renderer-components @kind types */
import type { ControlsContext } from '@drizztdourden08/brock-input/renderer';
import type { HudLayout } from '@rotp/hud';
import type { SlotAssignment, SlotIndex } from '@rotp/game-data';

interface AbsentAssignment {
  index: SlotIndex;
  assignment: SlotAssignment;
}

interface AbsentAssignmentsProps {
  entries: AbsentAssignment[];
}

interface SchemeLayoutRowProps {
  value: string;
  layouts: readonly HudLayout[];
  disabled?: boolean;
  onChange: (layoutId: string) => void;
}

interface SlotsFooterProps {
  context: ControlsContext;
  assignments: Readonly<Record<SlotIndex, SlotAssignment>>;
}

export type { AbsentAssignment, AbsentAssignmentsProps, SchemeLayoutRowProps, SlotsFooterProps };
