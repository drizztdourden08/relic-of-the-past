/* @layer renderer-widgets @kind component */
import { Box, SectionHeader, StatRow } from '../../../../design-system/primitives';
import type { StateSectionData } from '../behavior/build-state-sections';

const StateSection = (props: StateSectionData) => {
  const { title, rows } = props;
  return (
    <Box className="game-state__section">
      <SectionHeader title={title} />
      <Box className="game-state__rows">
        {rows.map((r) => (
          <StatRow key={r.label} label={r.label} value={r.value} mono={r.mono} />
        ))}
      </Box>
    </Box>
  );
};

export { StateSection };
