/* @layer sanctuary-site @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import playIcon from '@iconify-icons/lucide/play';
import { Flex, Text } from '@drizztdourden08/tessera/primitives';
import { FILE_TYPE_ICONS } from '../../../files/file-type-icon.constants';
import { mediaKindOf } from '@site-kit/lib/media-kind';
import { SelectionImage } from './SelectionImage';
import type { SelectionTileProps } from './SelectionTile.type';

const SelectionTile = (props: SelectionTileProps) => {
  const { file } = props;
  const kind = mediaKindOf(file.contentType);
  const picture = kind === 'image'
    ? <SelectionImage file={file} />
    : <IconifyIcon icon={kind === 'video' ? playIcon : FILE_TYPE_ICONS[file.type]} className="selection-tile__icon" />;

  return (
    <Flex direction="column" align="stretch" gap="xs" className="selection-tile" title={file.name}>
      <Flex align="center" justify="center" className="selection-tile__well" data-kind={kind ?? 'file'}>
        {picture}
      </Flex>
      <Text as="span" variant="caption" className="selection-tile__name">{file.name}</Text>
    </Flex>
  );
};

export { SelectionTile };
