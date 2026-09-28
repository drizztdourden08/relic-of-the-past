/* @layer store-site @kind component */
/**
 * One picture of the listing: what is live now (or the new one once picked, exactly as it
 * will be sent) beside a drop zone that takes a picture by drop, pick or paste and says, in
 * green, when one is ready.
 */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import imageIcon from '@iconify-icons/lucide/image';
import { Button } from '@ds/primitives/Button';
import { DropZone } from '@ds/primitives/DropZone';
import type { DropZoneStatus } from '@ds/primitives/DropZone';
import { Field } from '@ds/primitives/Field';
import { Flex } from '@ds/primitives/Flex';
import { Image } from '@ds/primitives/Image';
import type { MediaRef, StoreKind } from '@shared/store/types';
import { formatBytes } from '@site-kit/lib/format-bytes';
import { ItemPicture } from '../../../components/ItemPicture/ItemPicture';
import type { PictureState } from '../behavior/usePicture';

type PictureFieldProps = {
  label: string;
  /** The size it is cut to, such as "512 × 288". */
  size: string;
  role: 'card' | 'banner';
  state: PictureState;
  /** The picture the listing has now, if any. */
  current: MediaRef | null;
  kind: StoreKind;
};

const IMAGE_ACCEPT = ['image/*'];
const IMAGE_ICON = <IconifyIcon icon={imageIcon} aria-hidden="true" />;

const readyStatus = (state: PictureState, size: string): DropZoneStatus | undefined =>
  (state.picture ? { tone: 'success', message: `Ready: cut to ${size}, ${formatBytes(state.picture.blob.size)}` } : undefined);

const PictureField = (props: PictureFieldProps) => {
  const { label, size, role, state, current, kind } = props;
  const pick = (files: File[]) => {
    if (files[0]) void state.choose(files[0]);
  };
  return (
    <Field label={label} error={state.error ?? undefined}>
      <Flex align="stretch" gap="md" wrap className="publish__picture">
        {state.preview
          ? <Image src={state.preview} alt={`New ${role}`} className={`publish__preview publish__preview--${role}`} />
          : <ItemPicture picture={current} kind={kind} role={role} className={`publish__preview publish__preview--${role}`} />}
        <Flex direction="column" gap="xs" className="publish__picture-actions">
          <DropZone
            accept={IMAGE_ACCEPT}
            icon={IMAGE_ICON}
            label={state.busy ? 'Preparing...' : 'Drop a picture here'}
            hint={`Cut to ${size}`}
            disabled={state.busy}
            status={readyStatus(state, size)}
            onDrop={pick}
          />
          {state.picture && <Button variant="ghost" size="sm" onClick={state.clear}>Keep the current one</Button>}
        </Flex>
      </Flex>
    </Field>
  );
};

export { PictureField };
export type { PictureFieldProps };
