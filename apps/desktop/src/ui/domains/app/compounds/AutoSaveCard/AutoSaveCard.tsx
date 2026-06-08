/* @layer renderer-components @kind data */
import type { AutoSaveCardProps } from './AutoSaveCard.type';
import './AutoSaveCard.css';

const AutoSaveCard = (props: AutoSaveCardProps) => {
  const { id, timestamp, trigger, screenshotUrl, busy, onLoad, onDelete } = props;

  return (
    <div className={`auto-save-card ${busy ? 'auto-save-card--busy' : ''}`}>
      <div className="auto-save-card__thumb">
        {screenshotUrl ? (
          <img src={screenshotUrl} alt="Auto-save" className="auto-save-card__img" />
        ) : (
          <div className="auto-save-card__empty-thumb" />
        )}
      </div>
      <div className="auto-save-card__info">
        <span className="auto-save-card__time">
          {new Date(timestamp).toLocaleString(undefined, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
          })}
        </span>
        <span className={`auto-save-card__badge auto-save-card__badge--${trigger}`}>
          {trigger === 'quit' ? 'On Quit' : 'Timer'}
        </span>
      </div>
      <div className="auto-save-card__actions">
        <button
          className="auto-save-card__btn auto-save-card__btn--load"
          onClick={() => onLoad(id)}
          disabled={busy}
          title="Load auto-save"
        >
          Load
        </button>
        <button
          className="auto-save-card__btn auto-save-card__btn--delete"
          onClick={() => onDelete(id)}
          disabled={busy}
          title="Delete auto-save"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export { AutoSaveCard };
