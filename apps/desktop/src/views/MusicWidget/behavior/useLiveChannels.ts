/* @layer renderer-widgets @kind hook */
import { useEffect, useMemo, useState } from 'react';
import { createPreviewReportStore } from '@app/msu-studio/behavior/preview-report-store';
import { CHANNEL_TITLES, CHANNELS } from '../MusicWidget.constants';
import type { LiveChannel } from '../MusicWidget.type';
import { readChannelReport } from './read-channel-report';
import { readSessionActive } from './read-session-active';

const programDetail = (id: number, overlappingSets: number): string =>
  overlappingSets > 1 ? `id 0x${id.toString(16)} · ${overlappingSets} overlapping` : `id 0x${id.toString(16)}`;

const useLiveChannels = () => {
  const channels = useMemo<LiveChannel[]>(() => CHANNELS.map((name) => ({
    name, title: CHANNEL_TITLES[name], store: createPreviewReportStore(),
  })), []);
  const [sessionActive, setSessionActive] = useState(readSessionActive);

  useEffect(() => {
    let frame = 0;
    const poll = (): void => {
      setSessionActive(readSessionActive());
      for (const channel of channels) {
        const report = readChannelReport(channel.name);
        channel.store.publish(report === null ? null : {
          key: channel.name,
          elapsedSeconds: report.elapsedSeconds,
          layers: report.layers,
          detail: programDetail(report.id, report.setCount),
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
