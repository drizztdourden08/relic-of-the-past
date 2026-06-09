/* @layer renderer-widgets @kind component */
import { useState } from 'react';
import type { ReactNode, CSSProperties } from 'react';
import { Box, Text } from '../../../../design-system/primitives';
import { S } from '../styles';

/** A clickable info-row label that expands an inline description. */
const DescRow = ({ label, desc, children }: { label: string; desc: string; children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <Box>
      <Box style={S.infoRow}>
        <Text style={{ ...S.infoLabel, cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '2px' } as CSSProperties} onClick={() => setOpen(o => !o)}>{label}</Text>
        <Text style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{children}</Text>
      </Box>
      {open && (
        <Box style={{ fontSize: 9, color: 'var(--c-text-dim)', lineHeight: '12px', padding: '2px 0 4px 0', borderBottom: '1px solid var(--c-hover)' }}>{desc}</Box>
      )}
    </Box>
  );
};

export { DescRow };
