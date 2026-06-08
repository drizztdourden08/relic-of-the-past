/* @layer renderer-components @kind component */
﻿import type { PlaySession } from '@shared/types/session';
import { formatSessionDate, formatDuration } from './behavior/formatters';
import './PlaySessionCard.css';
import { type PlaySessionCardProps } from './types';


const PlaySessionCard = (props: PlaySessionCardProps) => {
  const { session } = props;

  return (
    <div className="session-card">
      <span className="session-card__dot" />
      <span className="session-card__date">{formatSessionDate(session.startedAt)}</span>
      {session.endedAt && (
        <span className="session-card__end">→ {new Date(session.endedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
      )}
      <span className="session-card__duration">{formatDuration(session.durationMs)}</span>
    </div>
  );
};

export {
  PlaySessionCard,
};
