/* @layer store-site @kind component */
/**
 * Moving and zooming a picked picture inside a frame of the shape the store keeps. The
 * picture shows dimmed outside the frame, so the author sees what is left out. Apply hands
 * back the crop in the picture's own pixels.
 */
import type { CSSProperties } from 'react';
import { DialogShell } from '@ds/composites/DialogShell';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Image } from '@ds/primitives/Image';
import { Slider } from '@ds/primitives/Slider';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import { MAX_ZOOM } from '../../lib/picture-crop';
import type { CropRect, Size } from '../../lib/picture-crop';
import { useCropEditor } from './behavior/useCropEditor';
import './CropDialog.css';

type CropDialogProps = {
  title: string;
  source: File;
  /** Width over height of the kept picture. */
  ratio: number;
  /** The crop in use, or null for the centred one. */
  initial: CropRect | null;
  onApply: (crop: CropRect) => void;
  onClose: () => void;
};

const ZOOM_STEP = 0.01;

const formatZoom = (value: number) => `${value.toFixed(1)}x`;

/** The picture's place under the frame, in percent of the frame, so it follows the frame's size. */
const pictureStyle = (crop: CropRect | null, size: Size | null): CSSProperties => (crop && size
  ? {
    width: `${(size.width / crop.width) * 100}%`,
    left: `${(-crop.x / crop.width) * 100}%`,
    top: `${(-crop.y / crop.height) * 100}%`,
  }
  : { visibility: 'hidden' });

const CropDialog = (props: CropDialogProps) => {
  const { title, source, ratio, initial, onApply, onClose } = props;
  const editor = useCropEditor({ source, ratio, initial });
  const { crop } = editor;

  const actions = (
    <>
      <Button variant="tertiary" onClick={editor.reset}>Reset</Button>
      <Button variant="secondary" onClick={onClose}>Cancel</Button>
      <Button variant="primary" disabled={!crop} onClick={() => crop && onApply(crop)}>Apply</Button>
    </>
  );

  return (
    <DialogShell open onClose={onClose} title={title} actions={actions} className="crop-dialog">
      <Stack gap="md" align="stretch">
        <Box
          ref={editor.stageRef}
          className="crop-dialog__stage"
          onPointerDown={editor.onPointerDown}
          onPointerMove={editor.onPointerMove}
          onPointerUp={editor.onPointerUp}
          onPointerCancel={editor.onPointerUp}
        >
          <Box ref={editor.frameRef} className="crop-dialog__frame" style={{ aspectRatio: ratio }}>
            <Image src={editor.url} alt="" draggable={false} onLoad={editor.onLoad} className="crop-dialog__picture" style={pictureStyle(crop, editor.size)} />
          </Box>
        </Box>
        <Slider label="Zoom" value={editor.zoom} min={1} max={MAX_ZOOM} step={ZOOM_STEP} onChange={editor.setZoom} formatValue={formatZoom} />
        <Text as="p" variant="caption">Drag to move. Scroll or use the slider to zoom.</Text>
      </Stack>
    </DialogShell>
  );
};

export { CropDialog };
export type { CropDialogProps };
