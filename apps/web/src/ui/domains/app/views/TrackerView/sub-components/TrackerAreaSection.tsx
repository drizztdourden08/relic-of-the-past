/* @layer renderer-components @kind component */
import { useState } from 'react';
import { Box, Text, Button } from '../../../../../design-system/primitives';
import type { CheckRecord } from '@shared/game/data';
import type { CheckStatus } from '@shared/game/logic/eval';
import { TrackerCheckRow } from './TrackerCheckRow';
import '../TrackerView.css';

interface TrackerAreaSectionProps {
  area: string;
  checks: CheckRecord[];
  statuses: Map<string, CheckStatus>;
}

const TrackerAreaSection = (props: TrackerAreaSectionProps) => {
  const { area, checks, statuses } = props;
  const [expanded, setExpanded] = useState(false);

  const completed = checks.filter(c => statuses.get(c.id) === 'completed').length;
  const reachable = checks.filter(c => statuses.get(c.id) === 'reachable').length;

  return (
    <Box className="tracker-area">
      <Button variant="bare" className="tracker-area__header" onClick={() => setExpanded(!expanded)}>
        <Text className="tracker-area__chevron">{expanded ? '▼' : '▶'}</Text>
        <Text className="tracker-area__name">{area}</Text>
        <Text className="tracker-area__counts">
          <Text className="tracker-area__count tracker-area__count--completed">{completed}</Text>
          /
          <Text className="tracker-area__count tracker-area__count--reachable">{reachable}</Text>
          /
          <Text className="tracker-area__count">{checks.length}</Text>
        </Text>
      </Button>
      {expanded && (
        <Box className="tracker-area__checks">
          {checks.map(check => (
            <TrackerCheckRow key={check.id} check={check} status={statuses.get(check.id) ?? 'blocked'} />
          ))}
        </Box>
      )}
    </Box>
  );
}

export { TrackerAreaSection };
