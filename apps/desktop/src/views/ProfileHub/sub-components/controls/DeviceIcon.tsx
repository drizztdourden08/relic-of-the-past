/* @layer renderer-components @kind component */
import { Image } from '@drizztdourden08/tessera/primitives';
import type { DeviceIconProps } from './DeviceRow.type';
import './DeviceIcon.css';

const DeviceIcon = ({ src, family, ready }: DeviceIconProps) => (
  <Image src={src} alt={family} className={`device-icon ${ready ? 'device-icon--ready' : 'device-icon--unavailable'}`} />
);

export { DeviceIcon };
