/* @layer renderer-components @kind component */
import { useSettings } from '@drizztdourden08/brock-react';
import { Box } from '@drizztdourden08/tessera/primitives';
import type { AppSettings } from '@app/settings.type';
import { OnlineSettings } from '../../ProfileHub/sub-components';
import type { OnlineTabProps } from './OnlineTab.type';

const OnlineTab = ({ profile }: OnlineTabProps) => {
  const { settings, patch } = useSettings<AppSettings>();
  return (
    <Box className="randomizer-online">
      <OnlineSettings profile={profile} settings={settings} onChange={patch} />
    </Box>
  );
};

export { OnlineTab };
