/* @layer renderer-widgets @kind component */
/**
 * Give items freely or through a check. "Free Give" shows every grantable item grouped by
 * category; "From Check" shows the check list, where a grant hands over what this run placed.
 */
import { Box, Button } from '@ds/primitives';
import { useWidgetPref } from '@app/hooks/useWidgetPref';
import { FreeGiveGrid } from './sub-components/FreeGiveGrid';
import { CheckGrantList } from './sub-components/CheckGrantList';

type Mode = 'free' | 'checks';

const ItemsTab = () => {
  const [mode, setMode] = useWidgetPref<Mode>('cheats', 'itemsMode', 'free');

  return (
    <Box className="cheats-tab-items">
      <Box className="cheats-items__mode-toggle">
        <Button variant={mode === 'free' ? 'secondary' : 'tertiary'} size="sm" onClick={() => setMode('free')}>
          Free Give
        </Button>
        <Button variant={mode === 'checks' ? 'secondary' : 'tertiary'} size="sm" onClick={() => setMode('checks')}>
          From Check
        </Button>
      </Box>

      {mode === 'free' ? <FreeGiveGrid /> : <CheckGrantList />}
    </Box>
  );
};

export { ItemsTab };
