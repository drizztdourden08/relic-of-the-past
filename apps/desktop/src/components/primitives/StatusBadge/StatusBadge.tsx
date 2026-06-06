import './StatusBadge.css';

type ScreenStatus = 'draft' | 'mapped' | 'verified' | undefined;

interface StatusBadgeProps {
  status: ScreenStatus;
  /** Show as interactive (clickable) or read-only */
  interactive?: boolean;
  onChange?: (status: ScreenStatus) => void;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  unsaved: { label: 'Unsaved', className: 'status-badge--unsaved' },
  draft: { label: 'Draft', className: 'status-badge--draft' },
  mapped: { label: 'Mapped', className: 'status-badge--mapped' },
  verified: { label: 'Verified', className: 'status-badge--verified' },
};

const STATUS_CYCLE: ScreenStatus[] = [undefined, 'draft', 'mapped', 'verified'];

const StatusBadge = ({ status, interactive = false, onChange }: StatusBadgeProps) => {
  const key = status ?? 'unsaved';
  const config = STATUS_CONFIG[key];

  const handleClick = () => {
    if (!interactive || !onChange) return;
    const currentIdx = STATUS_CYCLE.indexOf(status);
    const nextIdx = (currentIdx + 1) % STATUS_CYCLE.length;
    onChange(STATUS_CYCLE[nextIdx]);
  };

  return (
    <span
      className={`status-badge ${config.className} ${interactive ? 'status-badge--interactive' : ''}`}
      onClick={interactive ? handleClick : undefined}
      title={interactive ? 'Click to cycle status' : `Status: ${config.label}`}
    >
      {config.label}
    </span>
  );
};

export { StatusBadge };
export type { ScreenStatus };
