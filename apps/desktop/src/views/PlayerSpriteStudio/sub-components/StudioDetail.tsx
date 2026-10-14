/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { SpriteSheetViewer } from '@rotp/design/packs';
import { InstalledOriginBar } from '../../InstalledOriginBar';
import type { StudioDetailProps } from '../PlayerSpriteStudio.type';
import { PaletteEditor } from './PaletteEditor';
import { StudioToolbar } from './StudioToolbar';

const StudioDetail = (props: StudioDetailProps) => {
  const { sheet, openFile, installed, busy, status, draft, library, exporter, wearing, run, onOpenAfter, onUninstalled } = props;
  const readOnly = installed !== null;

  return (
    <Box className="sprite-studio">
      {installed && (
        <InstalledOriginBar pack={installed} onDuplicated={onOpenAfter} onUpdateInstalled={onOpenAfter} onUninstalled={onUninstalled} />
      )}
      <StudioToolbar
        meta={sheet.meta}
        file={openFile}
        dirty={draft.dirty}
        applied={draft.applied}
        busy={busy}
        readOnly={readOnly}
        onMeta={(meta) => draft.patch({ meta })}
        onSave={() => run(async () => { await draft.save(); await library.refresh(); })}
        onSaveAs={(container) => run(async () => {
          await draft.save(`${sheet.meta.name || 'sprite'}.${container}`);
          await library.refresh();
        })}
        onExport={(container) => run(() => exporter.exportSheet(sheet, container))}
        onRevert={draft.revert}
        onClose={draft.close}
      />
      {exporter.status && <Text className="sprite-studio__status">{exporter.status}</Text>}
      {status && <Text className="sprite-studio__status sprite-studio__status--error">{status}</Text>}

      <SpriteSheetViewer
        sheet={sheet}
        wearing={wearing}
        aside={(
          <PaletteEditor
            sheet={sheet}
            outfit={wearing.outfit}
            readOnly={readOnly}
            onColor={(index, word) => draft.setColor(wearing.outfit, index, word)}
            onGloveColor={draft.setGloveColor}
            onReset={(index) => draft.resetColor(wearing.outfit, index)}
          />
        )}
      />
    </Box>
  );
};

export { StudioDetail };
