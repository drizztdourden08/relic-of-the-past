/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Icon, Stack, Table, TableCell, TableRow, TableSection, Text } from '@drizztdourden08/tessera/primitives';
import { ROM_PLATFORM_LABELS } from './RomTable.constants';
import type { RomTableProps } from './RomTable.type';
import './RomTable.css';

const RomTable = ({ roms }: RomTableProps) => {
  const t = useT();
  return (
  <Stack gap="xs">
    <Text className="rom-table__title">Valid official ROMs</Text>
    <Table striped aria-label={t('compounds:upload-field.valid-official-roms')}>
      <TableSection head>
        <TableRow>
          <TableCell header className="rom-table__cell">Name</TableCell>
          <TableCell header className="rom-table__cell">Kind</TableCell>
          <TableCell header className="rom-table__cell">SHA-1</TableCell>
          <TableCell header align="center" className="rom-table__cell">Usable</TableCell>
        </TableRow>
      </TableSection>
      <TableSection>
        {roms.map((rom) => (
          <TableRow key={rom.sha1}>
            <TableCell className="rom-table__cell" data-supported={rom.supported}>{rom.name}</TableCell>
            <TableCell className="rom-table__cell" data-supported={rom.supported}>{ROM_PLATFORM_LABELS[rom.kind]}</TableCell>
            <TableCell className="rom-table__cell rom-table__hash" data-supported={rom.supported}>{rom.sha1}</TableCell>
            <TableCell align="center" className="rom-table__cell rom-table__mark">
              {rom.supported && <Icon name="check" label={t('compounds:upload-field.usable')} />}
            </TableCell>
          </TableRow>
        ))}
      </TableSection>
    </Table>
  </Stack>
  );
};

export { RomTable };
