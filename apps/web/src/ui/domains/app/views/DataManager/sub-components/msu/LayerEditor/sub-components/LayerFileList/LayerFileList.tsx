/* @layer renderer-components @kind component */
/**
 * A layer's file pool. Order is meaningful — a sequential loop plays it top to bottom, and the
 * resume snapshot stores an index into it — so reordering is an explicit move rather than a sort.
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

const LayerFileList = (props: LayerFileListProps) => {
  const { files, available, disabled = false, onChange } = props;
  const [picked, setPicked] = useState('');

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
    </Box>
  );
};

export { LayerFileList };
