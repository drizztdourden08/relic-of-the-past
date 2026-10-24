/* @layer renderer-app @kind component */
import type { PageProps, ScreenMeta } from '@drizztdourden08/brock-react';
import { Randomizer } from '@app/views/Randomizer';

const meta: ScreenMeta = { title: 'Run', icon: 'play', showHeader: true, order: 1, keywords: ['seed', 'session', 'progress', 'summary', 'activity', 'players'] };

const RandomizerRunPage = (props: PageProps) => {
  const { open } = props;
  return <Randomizer tab="run" open={open} />;
};

export default RandomizerRunPage;
export { meta };
