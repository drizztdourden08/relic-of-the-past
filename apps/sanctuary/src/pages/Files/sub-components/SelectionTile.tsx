/* @layer sanctuary-site @kind component */
/**
 * One picked file in the selection panel's grid: an image shows itself, a video shows a
 * play icon, anything else its type's icon, each over the file name.
 */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import playIcon from '@iconify-icons/lucide/play';
import type { SanctuaryFile } from '@shared/sanctuary/file-types';
import { Flex } from '@ds/primitives/Flex';
import { Text } from '@ds/primitives/Text';
import { FILE_TYPE_ICONS } from '../../../files/file-type-icon';
import { mediaKindOf } from '../../../files/media-kind';
import { SelectionImage } from './SelectionImage';

type SelectionTileProps = {
  file: SanctuaryFile;
};

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
export type { SelectionTileProps };
