/* @layer renderer-app @kind component */
import type { PageProps, ScreenMeta } from '@drizztdourden08/brock-react';
import { Randomizer } from '@app/views/Randomizer';

const meta: ScreenMeta = { title: 'Spoiler', icon: 'list', showHeader: true, order: 4, fill: true, keywords: ['placement', 'checks', 'locations', 'spheres'] };

const RandomizerSpoilerPage = (props: PageProps) => {
  const { open } = props;
  return <Randomizer tab="spoiler" open={open} />;
};

export default RandomizerSpoilerPage;
export { meta };
