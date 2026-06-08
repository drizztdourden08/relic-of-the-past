/* @layer renderer-widgets @kind component */
/** Reusable input controls for NavReviewPanel: status row, requirement editor, transit picker. */
import { useState } from 'react';
import { TextInput, NativeSelect } from '../../../components/primitives';
import type { ReviewStatus } from './types';
import { STATUS_BTNS, REQUIREMENT_OPTIONS, S } from './nav-review-styles';

const StatusRow = ({ status, comment, onStatus, onComment }: { status: ReviewStatus; comment?: string; onStatus: (s: ReviewStatus) => void; onComment: (c: string) => void }) => {
  return (
    <div style={S.reviewRow}>
      <div style={S.statusRow}>
        {STATUS_BTNS.map(b => (
          <button key={b.key} onClick={() => onStatus(b.key)} style={{ ...S.statusBtn, ...(status === b.key ? { color: b.color, borderColor: b.color } : {}) }}>
            {b.label}
          </button>
        ))}
      </div>
      {(status === 'bad' || status === 'yellow' || comment) && (
        <TextInput style={S.commentInput} placeholder="Note..." value={comment ?? ''} onChange={e => onComment(e.target.value)} />
      )}
    </div>
  );
};

const RequirementEditor = ({ current, onChange }: { current: string[][]; onChange: (reqs: string[][]) => void }) => {
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set(current.flat()));

  if (!editing) {
    return (
      <button style={S.editBtn} onClick={() => { setSelected(new Set(current.flat())); setEditing(true); }}>
        ✏️ Edit requirements
      </button>
    );
  }

  const toggle = (req: string) => {
    const next = new Set(selected);
    if (next.has(req)) next.delete(req); else next.add(req);
    setSelected(next);
  };

  const apply = () => {
    const reqs = selected.size > 0 ? [Array.from(selected)] : [];
    onChange(reqs);
    setEditing(false);
  };

  return (
    <div style={S.reqEditor}>
      <div style={S.reqGrid}>
        {REQUIREMENT_OPTIONS.map(req => (
          <button key={req} onClick={() => toggle(req)} style={{ ...S.reqChip, ...(selected.has(req) ? S.reqChipActive : {}) }}>
            {req}
          </button>
        ))}
      </div>
      <div style={S.reqActions}>
        <button style={S.editBtn} onClick={apply}>Apply</button>
        <button style={S.editBtn} onClick={() => setEditing(false)}>Cancel</button>
      </div>
    </div>
  );
};

const TransitTypePicker = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const options = ['door', 'passage', 'hole', 'ledge', 'staircase', 'dungeon_enter', 'whirlpool', 'warp_tile'];
  return (
    <NativeSelect style={S.selectInput} value={value} onChange={e => onChange(e.target.value)}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </NativeSelect>
  );
};

export { StatusRow, RequirementEditor, TransitTypePicker };
