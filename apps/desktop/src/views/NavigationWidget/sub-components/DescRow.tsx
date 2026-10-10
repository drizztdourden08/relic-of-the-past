/* @layer renderer-widgets @kind component */
import type { ReactNode } from 'react';
import { useWidgetPref } from '@drizztdourden08/brock-react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import './DescRow.css';

const DescRow = ({ label, desc, children }: { label: string; desc: string; children: ReactNode }) => {
  const [open, setOpen] = useWidgetPref<boolean>('navigation', `desc:${label}`, false);
  return (
    <Box>
      <Box className="nav-info-row">
        <Text onClick={() => setOpen(!open)} className="nav-desc-row__info-label">{label}</Text>
        <Text className="nav-desc-row__value-row">{children}</Text>
      </Box>
      {open && (
        <Box className="nav-desc-row__body">{desc}</Box>
      )}
    </Box>
  );
};

export { DescRow };
