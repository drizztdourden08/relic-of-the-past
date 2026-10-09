/* @layer renderer-app @kind component */
import type { PageProps, ScreenMeta } from '@drizztdourden08/brock-react';
import { Randomizer } from '@app/views/Randomizer';

const meta: ScreenMeta = { title: 'Options', icon: 'sliders-horizontal', order: 2, fill: true, keywords: ['seed', 'settings', 'pool', 'logic'] };

const RandomizerOptionsPage = (props: PageProps) => {
  const { open } = props;
  return <Randomizer tab="options" open={open} />;
};

export default RandomizerOptionsPage;
export { meta };
