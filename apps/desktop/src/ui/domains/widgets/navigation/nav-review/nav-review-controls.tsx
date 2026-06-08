/* @layer renderer-widgets @kind component */
/** Reusable input controls for NavReviewPanel: status row, requirement editor, transit picker. */
import { useState } from 'react';
import { Box, TextInput, Select } from '../../../../design-system/primitives';
import type { ReviewStatus } from './nav-review.type';
import { STATUS_BTNS, REQUIREMENT_OPTIONS, S } from './nav-review-styles';

const StatusRow = ({ status, comment, onStatus, onComment }: { status: ReviewStatus; comment?: string; onStatus: (s: ReviewStatus) => void; onComment: (c: string) => void }) => {
  return (
    <Box style={S.reviewRow}>
      <Box style={S.statusRow}>
        {STATUS_BTNS.map(b => (
          <Box as="button" key={b.key} onClick={() => onStatus(b.key)} style={{ ...S.statusBtn, ...(status === b.key ? { color: b.color, borderColor: b.color } : {}) }}>
            {b.label}
          </Box>
        ))}
      </Box>
      {(status === 'bad' || status === 'yellow' || comment) && (
        <TextInput style={S.commentInput} placeholder="Note..." value={comment ?? ''} onChange={e => onComment(e.target.value)} />
      )}
    </Box>
  );
};

const RequirementEditor = ({ current, onChange }: { current: string[][]; onChange: (reqs: string[][]) => void }) => {
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set(current.flat()));

  if (!editing) {
    return (
      <Box as="button" style={S.editBtn} onClick={() => { setSelected(new Set(current.flat())); setEditing(true); }}>
        ✏️ Edit requirements
      </Box>
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
    <Box style={S.reqEditor}>
      <Box style={S.reqGrid}>
        {REQUIREMENT_OPTIONS.map(req => (
          <Box as="button" key={req} onClick={() => toggle(req)} style={{ ...S.reqChip, ...(selected.has(req) ? S.reqChipActive : {}) }}>
            {req}
          </Box>
        ))}
      </Box>
      <Box style={S.reqActions}>
        <Box as="button" style={S.editBtn} onClick={apply}>Apply</Box>
        <Box as="button" style={S.editBtn} onClick={() => setEditing(false)}>Cancel</Box>
      </Box>
    </Box>
  );
};

const TRANSIT_OPTIONS = ['door', 'passage', 'hole', 'ledge', 'staircase', 'dungeon_enter', 'whirlpool', 'warp_tile']
  .map(o => ({ value: o, label: o }));

const TransitTypePicker = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  return (
    <Box style={S.selectInput}>
      <Select value={value} options={TRANSIT_OPTIONS} onChange={onChange} />
    </Box>
  );
};

export { StatusRow, RequirementEditor, TransitTypePicker };
