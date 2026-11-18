/* @layer renderer-widgets @kind hook */
import { useEffect, useMemo, useState } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { createPreviewReportStore } from '@app/msu-studio/behavior/preview-report-store';
import { CHANNEL_TITLES, CHANNELS } from '../MusicWidget.constants';
import type { LiveChannel } from '../MusicWidget.type';
import { readChannelReport } from './read-channel-report';
import { readSessionActive } from './read-session-active';

const programDetail = (t: I18n['t'], id: number, overlappingSets: number): string => {
  const hexId = id.toString(16);
  return overlappingSets > 1
    ? t('views-music:program.overlapping', { id: hexId, count: overlappingSets })
    : t('views-music:program.single', { id: hexId });
};

const useLiveChannels = () => {
  const t = useT();
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
          detail: programDetail(t, report.id, report.setCount),
        });
      }
      frame = requestAnimationFrame(poll);
    };
    frame = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(frame);
  }, [channels, t]);

  return { channels, sessionActive };
};

export { useLiveChannels };
