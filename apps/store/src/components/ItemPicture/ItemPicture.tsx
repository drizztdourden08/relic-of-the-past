/* @layer store-site @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Box, Image } from '@drizztdourden08/tessera/primitives';
import { mediaUrl } from '../../endpoints/media-url';
import { itemColorStyle } from '../../catalog/item-color-style';
import { KIND_ICONS } from '../../kinds/kinds.constants';
import type { ItemPictureProps } from './ItemPicture.type';
import './ItemPicture.css';

const ItemPicture = (props: ItemPictureProps) => {
  const { picture, kind, role = 'card', color, className = '' } = props;
  const src = mediaUrl(picture);
  const placeholder = (
    <Box as="span" className="item-picture__placeholder" aria-hidden="true">
      <Box as="span" className="item-picture__shade" />
      <Box as="span" className="item-picture__icon"><IconifyIcon icon={KIND_ICONS[kind]} /></Box>
    </Box>
  );
  return (
    <Box className={`item-picture item-picture--${role}${className ? ` ${className}` : ''}`} style={itemColorStyle(color)}>
      {src ? <Image src={src} alt="" loading="lazy" className="item-picture__image" fallback={placeholder} /> : placeholder}
    </Box>
  );
};

export { ItemPicture };
export type { ItemPictureProps } from './ItemPicture.type';
