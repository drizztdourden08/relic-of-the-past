import { CREDITS, getUsageLabel } from '@shared/data/credits';
import './CreditsTab.css';

export function CreditsPage() {
  return (
    <div className="credits-tab">
      <div className="credits-tab__header">
        <h2 className="credits-tab__title">Credits & Attributions</h2>
        <p className="credits-tab__subtitle">
          This project is built on the work of many talented people and communities.
        </p>
      </div>

      {CREDITS.map((category) => (
        <section key={category.id} className="credits-tab__section">
          <h3 className="credits-tab__section-title">{category.title}</h3>
          <div className="credits-tab__entries">
            {category.entries.map((entry) => (
              <div key={`${category.id}-${entry.name}`} className="credits-tab__entry">
                <div className="credits-tab__entry-header">
                  <span className="credits-tab__entry-name">{entry.name}</span>
                  <span className="credits-tab__entry-project">
                    {entry.url ? (
                      <a
                        className="credits-tab__link"
                        href={entry.url}
                        onClick={(e) => { e.preventDefault(); window.open(entry.url); }}
                      >
                        {entry.project}
                      </a>
                    ) : (
                      entry.project
                    )}
                  </span>
                  {entry.license && (
                    <span className="credits-tab__entry-license">{entry.license}</span>
                  )}
                </div>
                <p className="credits-tab__entry-description">{entry.description}</p>
                <div className="credits-tab__entry-usage">
                  <span className="credits-tab__usage-badge" data-level={entry.usage}>
                    {getUsageLabel(entry.usage)}
                  </span>
                  <span className="credits-tab__usage-note">{entry.usageNote}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
