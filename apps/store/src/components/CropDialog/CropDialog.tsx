/* @layer store-site @kind component */
import { DialogShell } from '@drizztdourden08/tessera/composites';
import { Box, Button, Image, Slider, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { MAX_ZOOM } from '../../picture-crop/picture-crop.constants';
import { useCropEditor } from './behavior/useCropEditor';
import { pictureStyle } from './behavior/picture-style';
import type { CropDialogProps } from './CropDialog.type';
import { ZOOM_STEP } from './CropDialog.constants';
import './CropDialog.css';

const formatZoom = (value: number) => `${value.toFixed(1)}x`;

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
export type { CropDialogProps } from './CropDialog.type';
