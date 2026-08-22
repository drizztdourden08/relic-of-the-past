/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import { TextInput } from '@ds/primitives/TextInput';
import { SectionHeader } from '@ds/primitives/SectionHeader';
import { getItem } from '@shared/game/data';
import type { NameTable, PauseLabelKey } from '@shared/game/language/types';
import './EditableTables.css';

/** Human-readable title for each fixed pause-menu section label. */
const LABEL_TITLES: Record<PauseLabelKey, string> = {
  item: 'Item section',
  equipment: 'Equipment section',
  'dungeon-item': 'Dungeon item section',
  crystals: 'Crystals section',
  pendants: 'Pendants section',
  do: 'Save & quit prompt',
};

/**
 * Item keys are `<item-record-id>-<tier>` (e.g. 'item-012-2'), unreadable on
 * their own. Split off the trailing tier digit to recover the record id and
 * resolve its display name from the dataset; fall back to the raw key if the
 * id doesn't parse or isn't registered.
 */
const itemLabelOf = (key: string): string => {
  const match = key.match(/^(.*)-\d+$/);
  const recordId = match ? match[1] : key;
  const name = getItem(recordId).randomizerName;
  return name || key;
};

const NamesTable = (props: NamesTableProps) => {
  const { names, onChangeItem, onChangeBottle, onChangeLabel, readOnly = false } = props;

  const itemKeys = useMemo(() => Object.keys(names.items).sort(), [names.items]);
  const bottleKeys = useMemo(
    () => Object.keys(names.bottles).map(Number).sort((a, b) => a - b),
    [names.bottles],
  );
  const labelKeys = useMemo(() => Object.keys(names.labels) as PauseLabelKey[], [names.labels]);

  return (
    <Box className="names-table">
      <SectionHeader title="Items" subtitle={`${itemKeys.length} entries`} />
      <Box className="names-table__rows">
        {itemKeys.map((key) => (
          <Box key={key} className="names-table__row">
            <Box className="names-table__key">
              <Text className="names-table__key-label">{itemLabelOf(key)}</Text>
              <Text className="names-table__key-id">{key}</Text>
            </Box>
            <TextInput
              className="names-table__value"
              value={names.items[key]}
              disabled={readOnly}
              onChange={(e) => onChangeItem(key, e.currentTarget.value)}
            />
          </Box>
        ))}
      </Box>

      <SectionHeader title="Bottles" subtitle={`${bottleKeys.length} entries`} />
      <Box className="names-table__rows">
        {bottleKeys.map((content) => (
          <Box key={content} className="names-table__row">
            <Box className="names-table__key">
              <Text className="names-table__key-id">Content {content}</Text>
            </Box>
            <TextInput
              className="names-table__value"
              value={names.bottles[content]}
              disabled={readOnly}
              onChange={(e) => onChangeBottle(content, e.currentTarget.value)}
            />
          </Box>
        ))}
      </Box>

      <SectionHeader title="Labels" subtitle={`${labelKeys.length} entries`} />
      <Box className="names-table__rows">
        {labelKeys.map((key) => (
          <Box key={key} className="names-table__row">
            <Box className="names-table__key">
              <Text className="names-table__key-label">{LABEL_TITLES[key]}</Text>
              <Text className="names-table__key-id">{key}</Text>
            </Box>
            <TextInput
              className="names-table__value"
              value={names.labels[key]}
              disabled={readOnly}
              onChange={(e) => onChangeLabel(key, e.currentTarget.value)}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

type NamesTableProps = {
  names: NameTable;
  onChangeItem: (key: string, value: string) => void;
  onChangeBottle: (content: number, value: string) => void;
  onChangeLabel: (key: PauseLabelKey, value: string) => void;
  readOnly?: boolean;
};

export { NamesTable };
export type { NamesTableProps };
