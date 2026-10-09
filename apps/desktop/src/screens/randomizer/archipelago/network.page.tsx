/* @layer renderer-app @kind component */
import type { PageProps, ScreenMeta } from '@drizztdourden08/brock-react';
import { Randomizer } from '@domains/app/views/Randomizer';

const meta: ScreenMeta = { title: 'Network', icon: 'server', order: 1, keywords: ['archipelago', 'server', 'connection', 'health', 'players'] };

const RandomizerNetworkPage = (props: PageProps) => {
  const { open } = props;
  return <Randomizer tab="network" open={open} />;
};

export default RandomizerNetworkPage;
export { meta };
