/* @layer renderer-components @kind component */
/**
 * A layer's file pool. Order is meaningful — a sequential loop plays it top to bottom, and the
 * resume snapshot stores an index into it — so reordering is an explicit move rather than a sort.
 *
 * A pool capped at one file says so in words where the add control would be, rather than leaving a
 * greyed-out picker: a disabled control that was live a moment ago reads as a fault, and the reason
 * it went away lives two controls further up the card.
 */
import { useMemo, useState } from 'react';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Flex } from '@ds/primitives/Flex';
import { IconButton } from '@ds/primitives/IconButton';
import { Select } from '@ds/primitives/Select';
import { Text } from '@ds/primitives/Text';
import { moveItem } from '../../behavior/layer-ops';
import type { LayerFileListProps } from './LayerFileList.type';

const ONE_FILE_NOTE
  = 'One file only while the order is Single — that one track repeats on itself. Remove it to '
  + 'choose another, or pick Sequential or Shuffle to play several.';

const LayerFileList = (props: LayerFileListProps) => {
  const { files, available, oneFileOnly = false, disabled = false, onChange } = props;
  const [picked, setPicked] = useState('');
  // An empty single-file layer still needs its one file, so the cap only closes the door once full.
  const full = oneFileOnly && files.length > 0;

  const options = useMemo(
    () => available.filter((name) => !files.includes(name)).map((name) => ({ value: name, label: name })),
    [available, files],
  );

  return (
    <Box className="layer-card__files">
      {files.length === 0 && <Text variant="caption">No files — this layer will not play.</Text>}
      {files.map((name, index) => (
        <Flex key={name} gap="xs" align="center" className="layer-card__file">
          <Text className="layer-card__file-name" title={name}>{index + 1}. {name}</Text>
          <IconButton
            variant="ghost" size="sm" label={`Move ${name} up`} disabled={disabled || index === 0}
            onClick={() => onChange(moveItem(files, index, -1))}
          >
            ↑
          </IconButton>
          <IconButton
            variant="ghost" size="sm" label={`Move ${name} down`} disabled={disabled || index === files.length - 1}
            onClick={() => onChange(moveItem(files, index, 1))}
          >
            ↓
          </IconButton>
          <IconButton
            variant="ghost" size="sm" label={`Remove ${name}`} disabled={disabled}
            onClick={() => onChange(files.filter((f) => f !== name))}
          >
            ✕
          </IconButton>
        </Flex>
      ))}
      {full ? (
        <Text variant="caption">{ONE_FILE_NOTE}</Text>
      ) : (
        <Flex gap="sm" align="center" className="layer-card__file-add">
          <Box className="layer-card__file-select">
            <Select
              value={picked}
              options={options}
              placeholder={options.length > 0 ? 'Add a file…' : 'No other audio in this pack'}
              disabled={disabled || options.length === 0}
              searchable
              size="sm"
              onChange={setPicked}
            />
          </Box>
          <Button
            variant="secondary" size="sm" disabled={disabled || !picked}
            onClick={() => { onChange([...files, picked]); setPicked(''); }}
          >
            Add
          </Button>
        </Flex>
      )}
    </Box>
  );
};

export { LayerFileList };
