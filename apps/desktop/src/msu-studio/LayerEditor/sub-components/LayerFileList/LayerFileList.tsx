/* @layer renderer-components @kind component */
import { useMemo, useState } from 'react';
import { Box, Button, Flex, IconButton, Select, Text } from '@drizztdourden08/tessera/primitives';
import { moveItem } from '../../behavior/move-item';
import { ONE_FILE_NOTE } from './LayerFileList.constants';
import type { LayerFileListProps } from './LayerFileList.type';

const LayerFileList = (props: LayerFileListProps) => {
  const { files, available, oneFileOnly = false, disabled = false, onChange } = props;
  const [picked, setPicked] = useState('');
  const full = oneFileOnly && files.length > 0;

  const options = useMemo(
    () => available.filter((name) => !files.includes(name)).map((name) => ({ value: name, label: name })),
    [available, files],
  );

  return (
    <Box className="layer-card__files">
      {files.length === 0 && <Text variant="caption">No files. This layer will not play.</Text>}
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
              placeholder={options.length > 0 ? 'Add a file...' : 'No other audio in this pack'}
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
