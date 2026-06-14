/* @layer renderer-components @kind component */
import { useState, useMemo } from 'react';
import { Box } from '../../../../../../../design-system/primitives/Box';
import { TextInput } from '../../../../../../../design-system/primitives/TextInput';
import { SectionHeader } from '../../../../../../../design-system/primitives/SectionHeader';
import { EmptyState } from '../../../../../../../design-system/primitives/EmptyState';
import { DialogueLineRow } from './DialogueLineRow';
import type { DialogueLine } from '@shared/types/language';

const DialogueLines = (props: { lines: DialogueLine[] }) => {
  const { lines } = props;
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return lines;
    return lines.filter((l) => l.content.toLowerCase().includes(q) || String(l.id) === q);
  }, [lines, filter]);

  return (
    <Box className="language-detail__lines">
      <SectionHeader
        title={`Dialogue (${lines.length})`}
        action={
          <TextInput
            value={filter}
            onChange={(e) => setFilter(e.currentTarget.value)}
            placeholder="Filter…"
          />
        }
      />
      <Box className="language-detail__lines-scroll">
        {filtered.length === 0
          ? <EmptyState message="No matching lines" />
          : filtered.map((line) => <DialogueLineRow key={line.id} line={line} />)}
      </Box>
    </Box>
  );
};

export { DialogueLines };
