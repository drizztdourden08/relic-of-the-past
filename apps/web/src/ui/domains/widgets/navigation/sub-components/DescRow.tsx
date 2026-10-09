/* @layer renderer-widgets @kind component */
import type { ReactNode, CSSProperties } from 'react';
import { useWidgetPref } from '@app/hooks/useWidgetPref';
import { Box, Text } from '../../../../design-system/primitives';
import { S } from '../styles';
import { IL } from './DescRow.constants';

const DescRow = ({ label, desc, children }: { label: string; desc: string; children: ReactNode }) => {
  const [open, setOpen] = useWidgetPref<boolean>('navigation', `desc:${label}`, false);
  return (
    <Box>
      <Box style={S.infoRow}>
        <Text style={{ ...S.infoLabel, cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '2px' } as CSSProperties} onClick={() => setOpen(!open)}>{label}</Text>
        <Text style={IL.valueRow}>{children}</Text>
      </Box>
      {open && (
        <Box style={IL.body}>{desc}</Box>
      )}
    </Box>
  );
};

export { DescRow };
