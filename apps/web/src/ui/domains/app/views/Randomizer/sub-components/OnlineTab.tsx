/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { useSearchStore } from '@app/stores/search-store';
import { OnlineSettings } from '../../ProfileHub/sub-components';
import type { OnlineTabProps } from './OnlineTab.type';

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
