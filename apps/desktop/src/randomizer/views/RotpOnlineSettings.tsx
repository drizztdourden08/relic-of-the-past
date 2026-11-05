/* @layer renderer-components @kind component */
import { useSettings } from '@drizztdourden08/brock-react';
import type { AppSettings } from '@app/settings.type';
import { OnlineSettings } from '@app/views/ProfileHub/sub-components';

const RotpOnlineSettings = () => {
  const { settings, patch } = useSettings<AppSettings>();
  return <OnlineSettings profile={null} settings={settings} onChange={patch} />;
};

export { RotpOnlineSettings };
