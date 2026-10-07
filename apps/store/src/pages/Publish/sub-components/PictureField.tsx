/* @layer store-site @kind component */
/**
 * One picture of the listing: what is live now (or the new one once picked, exactly as it
 * will be sent) at its real shape, beside a drop zone that takes a picture by drop, pick or
 * paste and says, in green, when one is ready. A picked picture can be moved and zoomed in
 * the crop dialog, opened from its preview.
 */
import { useState } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import cropIcon from '@iconify-icons/lucide/crop';
import imageIcon from '@iconify-icons/lucide/image';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { DropZone } from '@ds/primitives/DropZone';
import type { DropZoneStatus } from '@ds/primitives/DropZone';
import { Field } from '@ds/primitives/Field';
import { Flex } from '@ds/primitives/Flex';
import { Image } from '@ds/primitives/Image';
import type { MediaRef, StoreKind } from '@shared/store/types';
import { formatBytes } from '@site-kit/lib/format-bytes';
import { CropDialog } from '../../../components/CropDialog';
import { ItemPicture } from '../../../components/ItemPicture/ItemPicture';
import type { CropRect } from '../../../lib/picture-crop';
import type { PictureState } from '../behavior/usePicture';

type PictureFieldProps = {
  label: string;
  /** The size it is cut to, such as "1280 × 720". */
  size: string;
  role: 'card' | 'banner';
  state: PictureState;
  /** The picture the listing has now, if any. */
  current: MediaRef | null;
  kind: StoreKind;
  /** The colour picked for the item, shown on the placeholder while there is no picture. */
  color: string;
  /** The error to show now, if any; the drop zone is outlined in red while there is one. */
  error?: string;
  /** Called once a picture is dropped or picked, so its error may show. */
  onPick?: () => void;
};

const IMAGE_ACCEPT = ['image/*'];
const IMAGE_ICON = <IconifyIcon icon={imageIcon} aria-hidden="true" />;

const readyStatus = (state: PictureState, size: string): DropZoneStatus | undefined =>
  (state.picture ? { tone: 'success', message: `Ready: cut to ${size}, ${formatBytes(state.picture.blob.size)}` } : undefined);

const PictureField = (props: PictureFieldProps) => {
  const { label, size, role, state, current, kind, color, error, onPick } = props;
  const [adjusting, setAdjusting] = useState(false);
  const pick = (files: File[]) => {
    if (files[0]) void state.choose(files[0]);
    onPick?.();
  };
  const apply = (crop: CropRect) => {
    setAdjusting(false);
    void state.recrop(crop);
  };
  return (
    <Field label={label} error={error}>
      <Flex align="start" gap="md" wrap className="publish__picture">
        <Box className={`publish__preview publish__preview--${role}`}>
          {state.preview
            ? <Image src={state.preview} alt={`New ${role}`} className="publish__preview-image" />
            : <ItemPicture picture={current} kind={kind} role={role} color={color} />}
          {state.source && !state.busy && (
            <Button variant="secondary" size="sm" className="publish__adjust" onClick={() => setAdjusting(true)}>
              <IconifyIcon icon={cropIcon} aria-hidden="true" />
              Adjust
            </Button>
          )}
        </Box>
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
      {adjusting && state.source && (
        <CropDialog
          title={`Adjust the ${role}`}
          source={state.source}
          ratio={state.spec.width / state.spec.height}
          initial={state.crop}
          onApply={apply}
          onClose={() => setAdjusting(false)}
        />
      )}
    </Field>
  );
};

export { PictureField };
export type { PictureFieldProps };
