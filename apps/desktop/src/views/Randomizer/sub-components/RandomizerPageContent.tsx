/* @layer renderer-components @kind component */
import { PageActions } from '@drizztdourden08/brock-react';
import { EmptyState, Text } from '@drizztdourden08/tessera/primitives';
import { NOT_ARCHIPELAGO } from '../Randomizer.constants';
import { RunTab } from './RunTab';
import { NetworkTab } from './NetworkTab';
import { OnlineTab } from './OnlineTab';
import { OptionsTab } from './OptionsTab';
import { ActivityLog } from './ActivityLog';
import { SpoilerPanel } from './SpoilerPanel';
import type { RandomizerPageContentProps } from './RandomizerPageContent.type';

const RandomizerPageContent = (props: RandomizerPageContentProps) => {
  const { tab, archipelago, run, options, network, online, log, placedCount } = props;
  switch (tab) {
    case 'run': return <RunTab {...run} />;
    case 'options': return <OptionsTab {...options} />;
    case 'network': return archipelago ? <NetworkTab {...network} /> : <EmptyState message={NOT_ARCHIPELAGO} />;
    case 'online': return archipelago ? <OnlineTab {...online} /> : <EmptyState message={NOT_ARCHIPELAGO} />;
    case 'logs': return <ActivityLog {...log} />;
    case 'spoiler': return (
      <>
        {placedCount !== null && <PageActions><Text className="randomizer-page__count">{`${placedCount} locations`}</Text></PageActions>}
        <SpoilerPanel />
      </>
    );
  }
};

export { RandomizerPageContent };
