/* @layer store-site @kind component */
import { useState } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import cropIcon from '@iconify-icons/lucide/crop';
import imageIcon from '@iconify-icons/lucide/image';
import { Box, Button, DropZone, Field, Flex, Image } from '@drizztdourden08/tessera/primitives';
import type { DropZoneStatus } from '@drizztdourden08/tessera/primitives';
import { formatBytes } from '@rotp/hub-client';
import { CropDialog } from '../../../components/CropDialog';
import { ItemPicture } from '../../../components/ItemPicture/ItemPicture';
import type { CropRect } from '../../../lib/picture-crop';
import type { PictureState } from '../behavior/usePicture.type';
import { IMAGE_ACCEPT } from './PictureField.constants';
import type { PictureFieldProps } from './PictureField.type';

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
            icon={<IconifyIcon icon={imageIcon} aria-hidden="true" />}
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
