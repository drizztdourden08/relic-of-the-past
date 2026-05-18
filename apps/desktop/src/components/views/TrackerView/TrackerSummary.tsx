import './TrackerView.css';

interface TrackerSummaryProps {
  completed: number;
  reachable: number;
  blocked: number;
  total: number;
}

export const TrackerSummary = (props: TrackerSummaryProps) => {
  const { completed, reachable, blocked, total } = props;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="tracker-summary">
      <div className="tracker-summary__bar">
        <div
          className="tracker-summary__fill tracker-summary__fill--completed"
          style={{ width: `${(completed / total) * 100}%` }}
        />
        <div
          className="tracker-summary__fill tracker-summary__fill--reachable"
          style={{ width: `${(reachable / total) * 100}%` }}
        />
      </div>
      <div className="tracker-summary__stats">
        <span className="tracker-summary__stat tracker-summary__stat--completed">{completed} done</span>
        <span className="tracker-summary__stat tracker-summary__stat--reachable">{reachable} available</span>
        <span className="tracker-summary__stat tracker-summary__stat--blocked">{blocked} blocked</span>
        <span className="tracker-summary__stat tracker-summary__stat--total">{total} total</span>
        <span className="tracker-summary__stat">{pct}%</span>
      </div>
    </div>
  );
}
