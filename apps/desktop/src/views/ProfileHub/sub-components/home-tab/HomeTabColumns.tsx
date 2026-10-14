/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { AutoSavesSection } from './sections/AutoSavesSection';
import { NormalSavesSection } from './sections/NormalSavesSection';
import { PlaySessionsSection } from './sections/PlaySessionsSection';
import { QuickSavesSection } from './sections/QuickSavesSection';
import type { HomeTabColumnsProps } from './home-tab.type';
import './HomeTabColumns.css';

const HomeTabColumns = (props: HomeTabColumnsProps) => (
  <Box className="home-tab__columns">
    <Box className="home-tab__col-left">
      <QuickSavesSection {...props} />
      <PlaySessionsSection {...props} />
    </Box>

    <Box className="home-tab__col-right">
      <NormalSavesSection {...props} />
      <AutoSavesSection {...props} />
    </Box>
  </Box>
);

export { HomeTabColumns };
