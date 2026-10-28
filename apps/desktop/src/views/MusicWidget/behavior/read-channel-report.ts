/* @layer renderer-widgets @kind logic */
import { msuChannelReport } from '@app/game/msu-session';
import type { MsuChannelName } from '@rotp/msu';
import type { ChannelReport } from '../MusicWidget.type';

const readChannelReport = (name: MsuChannelName): ChannelReport | null => {
  const feed = window.__musicWidgetFeed;
  return feed === undefined ? msuChannelReport(name) : (feed.reports[name] ?? null);
};

export { readChannelReport };
