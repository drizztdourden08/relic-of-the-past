/* @layer renderer-widgets @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { DescRow } from './DescRow';
import type { ProgressRowsProps } from './GameStatePanel.type';

const ProgressRows = ({ progressInfo, displayedVariant, dynamicBlockerCount }: ProgressRowsProps) => (
  <>
    {progressInfo && (
      <DescRow label="Phase" desc="The game's progress indicator byte. Controls NPC dialogue, event triggers, and overworld tile patches. Advances as you complete key objectives.">
        <Text className="nav-val-warning">{progressInfo.label}</Text>
        <Text className="nav-val-badge">0x{progressInfo.tier.toString(16).padStart(2, '0')}</Text>
      </DescRow>
    )}
    {displayedVariant && (
      <>
        <DescRow label="Tile Patch" desc="Whether this screen has an active event overlay that modifies walkable tiles (e.g. rocks removed after an event).">
          {displayedVariant.eventOverlayActive
            ? <Text className="nav-val-green">active</Text>
            : <Text className="nav-val-muted">none</Text>}
        </DescRow>
        <DescRow label="Flags" desc="Screen-specific event flags from SRAM. Track permanent world changes like opened chests, pulled levers, and destroyed barriers.">
          <Text className="nav-val-dim">0x{displayedVariant.screenEventFlags.toString(16).padStart(2, '0')}</Text>
        </DescRow>
        <DescRow label="NPC Blockers" desc="Number of sprites currently blocking BFS pathfinding (tutorial guards, barriers). These physically prevent the player from passing.">
          <Text className={dynamicBlockerCount > 0 ? 'nav-val-warning' : 'nav-val-muted'}>{dynamicBlockerCount}</Text>
        </DescRow>
      </>
    )}
  </>
);

export { ProgressRows };
