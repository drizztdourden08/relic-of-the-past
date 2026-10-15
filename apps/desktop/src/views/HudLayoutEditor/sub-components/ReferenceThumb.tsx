/* @layer renderer-components @kind component */
import { Icon, Image, Text } from '@drizztdourden08/tessera/primitives';
import { THUMB_ICON_SIZE } from './ReferenceField.constants';
import type { ReferenceThumbProps } from './ReferenceThumb.type';

const ReferenceThumb = (props: ReferenceThumbProps) => {
  const { src, placeholder = 'circle-help', specimen } = props;

  if (specimen !== undefined) return <Text className="hud-ref-field__specimen">{specimen}</Text>;
  return (
    <Image
      frame
      fit="contain"
      pixelated
      src={src}
      alt=""
      fallback={<Icon name={placeholder} size={THUMB_ICON_SIZE} aria-hidden />}
      className="hud-ref-field__thumb"
    />
  );
};

export { ReferenceThumb };
