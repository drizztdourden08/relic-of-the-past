/* @layer renderer-components @kind component */
import { Image } from '@drizztdourden08/tessera/primitives';
import { placedPartStyle } from './placed-part-style';
import type { PlacedPartProps } from './PlacedPart.type';
import './PlacedPart.css';

const PlacedPart = ({ box, src }: PlacedPartProps) => (
  <Image className="placed-part" src={src} style={placedPartStyle(box)} alt="" draggable={false} />
);

export { PlacedPart };
