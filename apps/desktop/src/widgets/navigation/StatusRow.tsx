/* @layer renderer-widgets @kind component */
import { TextInput } from '../../components/primitives';
import type { ReviewStatus } from './dataset-widget-types';
import { STATUS_BTNS, S } from './dataset-widget-styles';

interface StatusRowProps {
  status: ReviewStatus;
  comment?: string;
  onStatus: (s: ReviewStatus) => void;
  onComment: (c: string) => void;
}

const StatusRow = ({ status, comment, onStatus, onComment }: StatusRowProps) => {
  return (
    <div>
      <div style={S.statusRow}>
        {STATUS_BTNS.map(b => (
          <button key={b.key} onClick={() => onStatus(b.key)} style={{ ...S.statusBtn, ...(status === b.key ? { color: b.color, borderColor: b.color } : {}) }}>
            {b.label}
          </button>
        ))}
      </div>
      {(status === 'bad' || status === 'yellow') && (
        <TextInput style={S.commentInput} placeholder="Note..." value={comment ?? ''} onChange={e => onComment(e.target.value)} />
      )}
    </div>
  );
};

export { StatusRow };
