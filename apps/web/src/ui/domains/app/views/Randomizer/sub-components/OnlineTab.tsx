/* @layer renderer-components @kind component */
/**
 * The Online tab of the Randomizer page: the profile's Online settings, the same component
 * the settings' Online tab shows. It reads and writes through the settings bridge the profile's
 * settings screen registers (search-store.ts), so a change lands in the same config.json and
 * acts at once in both places. The bridge is up whenever a profile is open, game or not.
 */
import { Box, Text } from '@ds/primitives';
import { useSearchStore } from '@app/stores/search-store';
import { OnlineSettings } from '../../ProfileHub/sub-components';

interface OnlineTabProps {
  profile: Profile | null;
}

const OnlineTab = ({ profile }: OnlineTabProps) => {
  const settings = useSearchStore((state) => state.settings);
  const applyPatch = useSearchStore((state) => state.applyPatch);
  if (settings === null || applyPatch === null) {
    return <Box className="randomizer-online"><Text className="randomizer-page__hint">No profile is loaded.</Text></Box>;
  }
  return (
    <Box className="randomizer-online">
      <OnlineSettings profile={profile} settings={settings} onChange={applyPatch} />
    </Box>
  );
};

export { OnlineTab };
export type { OnlineTabProps };
