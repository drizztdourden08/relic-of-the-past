/* @layer renderer-widgets @kind component */
/**
 * The two one-shot actions that sit outside the percentage grid: drop to a single heart, or to
 * none at all. Kept apart from the stat controls so a stray click on a slider row can never reach
 * them.
 */
import { Box, Button } from '@ds/primitives';
import { cheatSetHealth } from '@app/lib/game';
import { HEART_UNITS } from '../StatsTab.constants';

const DangerActions = () => (
  <Box className="cheats-row">
    <Button variant="danger" size="sm" onClick={() => cheatSetHealth(HEART_UNITS)}>Set 1♥</Button>
    <Button variant="danger" size="sm" onClick={() => cheatSetHealth(0)}>Kill Player</Button>
  </Box>
);

export { DangerActions };
