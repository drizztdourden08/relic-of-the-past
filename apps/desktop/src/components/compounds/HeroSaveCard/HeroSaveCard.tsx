import type { HeroSaveCardProps } from './types';
import './HeroSaveCard.css';

const HeroSaveCard = (props: HeroSaveCardProps) => {
  const { name, timestamp, screenshotUrl, onLoad, busy } = props;

  return (
    <div className={`hero-save-card ${busy ? 'hero-save-card--busy' : ''}`}>
      <div className="hero-save-card__thumb">
        {screenshotUrl ? (
          <img src={screenshotUrl} alt={name} className="hero-save-card__img" />
        ) : (
          <div className="hero-save-card__empty-thumb">
            <span className="hero-save-card__no-screenshot">No Screenshot</span>
          </div>
        )}
      </div>
      <div className="hero-save-card__content">
        <span className="hero-save-card__label">Last Save</span>
        <span className="hero-save-card__name">{name}</span>
        <span className="hero-save-card__time">
          {new Date(timestamp).toLocaleString(undefined, {
            weekday: 'short', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
        </span>
        <button
          className="hero-save-card__load-btn"
          onClick={onLoad}
          disabled={busy}
        >
          Load Save
        </button>
      </div>
    </div>
  );
};

export { HeroSaveCard };
