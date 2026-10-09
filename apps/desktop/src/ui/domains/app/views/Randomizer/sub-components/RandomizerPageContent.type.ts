/* @layer renderer-components @kind types */
import type { RandomizerTab } from '../Randomizer.type';
import type { RunTabProps } from './RunTab.type';
import type { NetworkTabProps } from './NetworkTab';
import type { OnlineTabProps } from './OnlineTab.type';
import type { OptionsTabProps } from './OptionsTab.type';
import type { ActivityLogProps } from './ActivityLog.type';

interface RandomizerPageContentProps {
  tab: RandomizerTab;
  archipelago: boolean;
  run: RunTabProps;
  options: OptionsTabProps;
  network: NetworkTabProps;
  online: OnlineTabProps;
  log: ActivityLogProps;
  placedCount: number | null;
}

export type { RandomizerPageContentProps };
