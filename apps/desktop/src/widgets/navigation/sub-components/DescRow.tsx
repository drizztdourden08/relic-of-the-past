/* @layer renderer-widgets @kind component */
import { useState } from 'react';
import type { ReactNode, CSSProperties } from 'react';
import { S } from '../styles';

/** A clickable info-row label that expands an inline description. */
const DescRow = ({ label, desc, children }: { label: string; desc: string; children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div style={S.infoRow}>
        <span style={{ ...S.infoLabel, cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '2px' } as CSSProperties} onClick={() => setOpen(o => !o)}>{label}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{children}</span>
      </div>
      {open && (
        <div style={{ fontSize: 9, color: '#999', lineHeight: '12px', padding: '2px 0 4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{desc}</div>
      )}
    </div>
  );
};

export { DescRow };
