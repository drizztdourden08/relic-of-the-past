/* @layer renderer-widgets @kind hook */
/**
 * A frame-rate feed of every session channel, for the debugger's meters.
 *
 * The same store-per-readout arrangement the studio's preview uses, one per channel: the poll
 * runs on animation frames, each store deduplicates to the precision its meters draw, and
 * only the readout that changed redraws. Stores are keyed by CHANNEL name, not the sounding id,
 * so one readout per channel stays subscribed across track changes instead of unmounting at
 * exactly the moment worth watching.
 */
import { useEffect, useMemo, useState } from 'react';
import type { MsuChannelName } from '@app/lib/msu/engine';
import { isMsuSessionActive, msuChannelReport } from '@app/lib/game/msu-session';
import { createPreviewReportStore } from '@domains/app/views/DataManager/sub-components/msu/behavior/preview-report-store';
import type { PreviewReportStore } from '@domains/app/views/DataManager/sub-components/msu/behavior/preview-report-store';

const CHANNELS: readonly MsuChannelName[] = ['music', 'ambient', 'sfx1', 'sfx2'];

const CHANNEL_TITLES: Record<MsuChannelName, string> = {
  music: 'Music', ambient: 'Ambient bed', sfx1: 'Effects 1', sfx2: 'Effects 2',
};

interface LiveChannel {
  name: MsuChannelName;
  title: string;
  store: PreviewReportStore;
}

/** How many trigger sets are sounding at once, plus which program id the channel is on. */
const detailOf = (id: number, setCount: number): string =>
  setCount > 1 ? `id 0x${id.toString(16)} · ${setCount} overlapping` : `id 0x${id.toString(16)}`;

const useLiveChannels = () => {
  const channels = useMemo<LiveChannel[]>(() => CHANNELS.map((name) => ({
    name, title: CHANNEL_TITLES[name], store: createPreviewReportStore(),
  })), []);
  // The session comes and goes with the profile and the pack, usually after this widget is
  // already mounted, so it is polled with the channels instead of read once.
  const [sessionActive, setSessionActive] = useState(isMsuSessionActive);

  useEffect(() => {
    let frame = 0;
    const poll = (): void => {
      setSessionActive(isMsuSessionActive());
      for (const channel of channels) {
        const report = msuChannelReport(channel.name);
        channel.store.publish(report === null ? null : {
          key: channel.name,
          elapsedSeconds: report.elapsedSeconds,
          layers: report.layers,
          detail: detailOf(report.id, report.setCount),
        });
      }
      frame = requestAnimationFrame(poll);
    };
    frame = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(frame);
  }, [channels]);

  return { channels, sessionActive };
};

export { useLiveChannels };
export type { LiveChannel };
