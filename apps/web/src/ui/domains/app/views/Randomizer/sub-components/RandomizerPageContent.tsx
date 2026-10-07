/* @layer renderer-components @kind component */
/**
 * The Randomizer page's content pane: the active tab inside the page frame the profile hub
 * uses (glowing icon, title over the scene, section links). Online goes through the settings
 * page context instead, so its settings layout draws the frame and its own section links,
 * exactly as Settings > Online does in the hub.
 */
import type { ReactNode } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Text } from '@ds/primitives';
import { SceneBackdrop } from '@domains/title';
import { SettingsPage } from '../../../compounds/SettingsPage';
import type { SettingsPageAnchor } from '../../../compounds/SettingsPage';
import { SettingsPageContext } from '../../../compounds/SettingsLayout';
import { LOCAL_RUN_ANCHORS, RANDOMIZER_TABS, RUN_ANCHORS } from '../Randomizer.constants';
import type { RandomizerTab } from '../Randomizer.constants';
import { RunTab } from './RunTab';
import type { RunTabProps } from './RunTab';
import { NetworkTab } from './NetworkTab';
import type { NetworkTabProps } from './NetworkTab';
import { OnlineTab } from './OnlineTab';
import type { OnlineTabProps } from './OnlineTab';
import { OptionsTab } from './OptionsTab';
import type { OptionsTabProps } from './OptionsTab';
import { ActivityLog } from './ActivityLog';
import type { ActivityLogProps } from './ActivityLog';
import { SpoilerPanel } from './SpoilerPanel';

/** A page header is short, so its water line sits low to keep the castle in view. */
const HEADER_HORIZON = 0.72;

interface RandomizerPageContentProps {
  tab: RandomizerTab;
  run: RunTabProps;
  options: OptionsTabProps;
  network: Omit<NetworkTabProps, 'frame'>;
  online: OnlineTabProps;
  log: ActivityLogProps;
  /** How many locations the loaded seed places, shown in the Spoiler page's header. */
  placedCount: number | null;
}

const iconOf = (tab: RandomizerTab): ReactNode => <IconifyIcon icon={RANDOMIZER_TABS[tab].navIcon} />;
const backdrop = <SceneBackdrop horizon={HEADER_HORIZON} />;

const frameOf = (tab: RandomizerTab, actions?: ReactNode) =>
  (children: ReactNode, anchors?: SettingsPageAnchor[]) => (
    <SettingsPage
      icon={iconOf(tab)}
      title={RANDOMIZER_TABS[tab].label}
      backdrop={backdrop}
      anchors={anchors}
      scroll={RANDOMIZER_TABS[tab].scroll ?? true}
      actions={actions}
    >
      {children}
    </SettingsPage>
  );

const RandomizerPageContent = (props: RandomizerPageContentProps) => {
  const { tab, run, options, network, online, log, placedCount } = props;
  switch (tab) {
    case 'run': {
      const hasRun = run.config !== null && run.profileId !== null && run.profileName !== null;
      const anchors = run.config?.mode === 'online' ? RUN_ANCHORS : LOCAL_RUN_ANCHORS;
      return frameOf('run')(<RunTab {...run} />, hasRun ? anchors : undefined);
    }
    case 'options': return frameOf('options')(<OptionsTab {...options} />);
    case 'network': return <NetworkTab {...network} frame={frameOf('network')} />;
    case 'online': {
      const page = { variant: 'page' as const, icon: iconOf('online'), title: RANDOMIZER_TABS.online.label, backdrop, query: '' };
      return <SettingsPageContext.Provider value={page}><OnlineTab {...online} /></SettingsPageContext.Provider>;
    }
    case 'logs': return frameOf('logs')(<ActivityLog {...log} />);
    case 'spoiler': {
      const count = placedCount === null ? undefined : <Text className="randomizer-page__count">{`${placedCount} locations`}</Text>;
      return frameOf('spoiler', count)(<SpoilerPanel />);
    }
  }
};

export { RandomizerPageContent };
export type { RandomizerPageContentProps };
