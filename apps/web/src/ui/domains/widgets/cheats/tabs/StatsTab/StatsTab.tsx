/* @layer renderer-widgets @kind component */
/**
 * One control per player property (health, magic, bombs, arrows, rupees and the
 * capacities behind them), rendered from the stat table, not hand-built row by row.
 */
import { Box } from '@ds/primitives';
import { useStatSpecs } from './behavior/useStatSpecs';
import { StatControl } from './sub-components/StatControl';
import { DangerActions } from './sub-components/DangerActions';

const StatsTab = () => {
  const groups = useStatSpecs();

  return (
    <Box className="cheats-tab-stats">
      {groups.map(group => (
        <Box key={group.id} className="cheats-section">
          <Box className="cheats-section__title">{group.title}</Box>
          {group.stats.map(spec => <StatControl key={spec.id} spec={spec} />)}
        </Box>
      ))}

      <Box className="cheats-section">
        <Box className="cheats-section__title">Danger</Box>
        <DangerActions />
      </Box>
    </Box>
  );
};

export { StatsTab };
