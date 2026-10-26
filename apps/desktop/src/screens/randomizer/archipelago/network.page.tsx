/* @layer renderer-app @kind component */
import type { PageProps, ScreenMeta } from '@drizztdourden08/brock-react';
import { Randomizer } from '@app/views/Randomizer';
import { isOnlineExperimental } from '@app/shell/show-rules';

const meta: ScreenMeta = { title: 'Network', icon: 'server', showHeader: true, order: 1, when: isOnlineExperimental, keywords: ['archipelago', 'server', 'connection', 'health', 'players'] };

const RandomizerNetworkPage = (props: PageProps) => {
  const { open } = props;
  return <Randomizer tab="network" open={open} />;
};

export default RandomizerNetworkPage;
export { meta };
