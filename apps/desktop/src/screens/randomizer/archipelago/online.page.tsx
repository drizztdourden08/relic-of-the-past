/* @layer renderer-app @kind component */
import type { PageProps, ScreenMeta } from '@drizztdourden08/brock-react';
import { Randomizer } from '@app/views/Randomizer';

const meta: ScreenMeta = { title: 'Online', icon: 'globe', order: 2, keywords: ['archipelago', 'death link', 'track other players'] };

const RandomizerOnlinePage = (props: PageProps) => {
  const { open } = props;
  return <Randomizer tab="online" open={open} />;
};

export default RandomizerOnlinePage;
export { meta };
