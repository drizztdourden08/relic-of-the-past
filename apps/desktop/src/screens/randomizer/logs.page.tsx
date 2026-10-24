/* @layer renderer-app @kind component */
import type { PageProps, ScreenMeta } from '@drizztdourden08/brock-react';
import { Randomizer } from '@app/views/Randomizer';

const meta: ScreenMeta = { title: 'Logs', icon: 'file-text', showHeader: true, order: 3, fill: true, keywords: ['log', 'activity', 'room', 'messages'] };

const RandomizerLogsPage = (props: PageProps) => {
  const { open } = props;
  return <Randomizer tab="logs" open={open} />;
};

export default RandomizerLogsPage;
export { meta };
