/* @layer store-site @kind logic */
import type { CSSProperties } from 'react';
import type { CropRect, Size } from '../../../picture-crop/picture-crop.type';

const pictureStyle = (crop: CropRect | null, size: Size | null): CSSProperties => (crop && size
  ? {
    width: `${(size.width / crop.width) * 100}%`,
    left: `${(-crop.x / crop.width) * 100}%`,
    top: `${(-crop.y / crop.height) * 100}%`,
  }
  : { visibility: 'hidden' });

export { pictureStyle };
