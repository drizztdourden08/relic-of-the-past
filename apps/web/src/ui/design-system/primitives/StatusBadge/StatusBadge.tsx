/* @layer renderer-components @kind component */
import './StatusBadge.css';

type ScreenStatus = 'draft' | 'mapped' | 'verified' | undefined;

interface StatusBadgeProps {
  status: ScreenStatus;
  /** Show as interactive (clickable) or read-only */
  interactive?: boolean;
  onChange?: (status: ScreenStatus) => void;
  /**
   * Label per status key, injected by the caller — this primitive cannot
   * import the dataset directly (design-system/domain dependency invariant),
   * so the canonical `enumerationFor('screen-status')` labels live one layer
   * up, in whatever domain code renders a badge. Missing or omitted keys fall
   * back to `DEFAULT_LABELS`, so the badge still renders standalone.
   */
  labels?: Partial<Record<'unsaved' | NonNullable<ScreenStatus>, string>>;
}

const STATUS_CLASS: Record<string, string> = {
  unsaved: 'status-badge--unsaved',
  draft: 'status-badge--draft',
  mapped: 'status-badge--mapped',
  verified: 'status-badge--verified',
};

const DEFAULT_LABELS: Record<string, string> = {
  unsaved: 'Unsaved',
  draft: 'Draft',
  mapped: 'Mapped',
  verified: 'Verified',
};

const STATUS_CYCLE: ScreenStatus[] = [undefined, 'draft', 'mapped', 'verified'];

const StatusBadge = ({ status, interactive = false, onChange, labels }: StatusBadgeProps) => {
  const key = status ?? 'unsaved';
  const className = STATUS_CLASS[key];
  const label = labels?.[key] ?? DEFAULT_LABELS[key];

  const handleClick = () => {
    if (!interactive || !onChange) return;
    const currentIdx = STATUS_CYCLE.indexOf(status);
    const nextIdx = (currentIdx + 1) % STATUS_CYCLE.length;
    onChange(STATUS_CYCLE[nextIdx]);
  };

  return (
    <span
      className={`status-badge ${className} ${interactive ? 'status-badge--interactive' : ''}`}
      onClick={interactive ? handleClick : undefined}
      title={interactive ? 'Click to cycle status' : `Status: ${label}`}
    >
      {label}
    </span>
  );
};

export { StatusBadge };
export type { ScreenStatus, StatusBadgeProps };
