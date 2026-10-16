/* @layer renderer-components @kind component */
import { Image } from '@drizztdourden08/tessera/primitives';
import type { SaveRowThumbProps } from '../SaveRow.type';

const SaveRowThumb = ({ src }: SaveRowThumbProps) => (
  <Image frame pixelated src={src ?? undefined} alt="" className="save-row__thumb" />
);

export { SaveRowThumb };
