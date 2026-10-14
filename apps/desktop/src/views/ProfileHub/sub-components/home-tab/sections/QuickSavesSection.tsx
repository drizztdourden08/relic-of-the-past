/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { SaveSlot } from '../../../../../compounds/SaveSlot';
import type { HomeTabColumnsProps } from '../home-tab.type';

const QuickSavesSection = ({ saves, isGameRunning }: HomeTabColumnsProps) => {
  const { slots, busySlot, handleQuickSave, handleQuickLoad } = saves;
  return (
    <Box as="section" className="home-tab__section">
      <Text as="h3" className="home-tab__section-title">Quick Saves</Text>
      <Box className="home-tab__save-grid">
        {slots.map((s) => (
          <SaveSlot
            key={s.slot}
            slot={s.slot}
            screenshotUrl={s.screenshot}
            timestamp={s.timestamp ?? 0}
            isEmpty={!s.timestamp}
            busy={busySlot === s.slot}
            disableSave={!isGameRunning}
            onSave={handleQuickSave}
            onLoad={handleQuickLoad}
          />
        ))}
      </Box>
    </Box>
  );
};

export { QuickSavesSection };
