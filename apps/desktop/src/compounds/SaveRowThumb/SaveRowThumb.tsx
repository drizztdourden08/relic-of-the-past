/* @layer renderer-components @kind component */
import { Image } from '@drizztdourden08/tessera/primitives';
import type { SaveRowThumbProps } from './SaveRowThumb.type';
import './SaveRowThumb.css';

const SaveRowThumb = ({ src }: SaveRowThumbProps) => (
  <Image frame pixelated src={src ?? undefined} alt="" className="save-row-thumb" />
);

export { SaveRowThumb };
