/* @layer renderer-components @kind component */
import { useState, useMemo, useCallback, useEffect } from 'react';
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import { Button } from '@ds/primitives/Button';
import { SegmentedControl } from '@ds/primitives/SegmentedControl';
import { RangeInput } from '@ds/primitives/RangeInput';
import { MasterDetailLayout } from '@ds/composites/MasterDetailLayout';
import { stateFor } from '@shared/game/data/native-tables/player-pose-atlas';
import { resolvePalette } from '@app/lib/game/player-sheet/resolve-palette';
import { useSpriteLibrary } from './behavior/useSpriteLibrary';
import { useSpriteDraft } from './behavior/useSpriteDraft';
import { useWearing } from './behavior/useWearing';
import { useAnimationClock } from './behavior/useAnimationClock';
import { useSpriteExport } from './behavior/useSpriteExport';
import { SpriteLibraryList } from './sub-components/SpriteLibraryList';
import { WearingBar } from './sub-components/WearingBar';
import { StateList } from './sub-components/StateList';
import { StatePreview } from './sub-components/StatePreview';
import { ContactSheet } from './sub-components/ContactSheet';
import { SheetBrowser } from './sub-components/SheetBrowser';
import { PaletteEditor } from './sub-components/PaletteEditor';
import { StudioToolbar } from './sub-components/StudioToolbar';
import { fetchToBytes } from '@shared/storage/download';
import './PlayerSpriteStudio.css';
import type { StudioView, PlayerSpriteStudioProps } from './PlayerSpriteStudio.type';

const VIEW_OPTIONS = [
  { value: 'state', label: 'One state' },
  { value: 'contact', label: 'All states' },
  { value: 'sheet', label: 'Tile sheet' },
];
const MIN_SCALE = 1;
const MAX_SCALE = 8;

const PlayerSpriteStudio = (props: PlayerSpriteStudioProps) => {
  const { romStatuses, onDeleteConfirm } = props;

  const romWithAssets = useMemo(() => romStatuses.find((r) => r.hasAssets)?.romFile ?? null, [romStatuses]);
  const library = useSpriteLibrary();
  const draft = useSpriteDraft(romWithAssets);
  const wearing = useWearing();
  const clock = useAnimationClock();
  const exporter = useSpriteExport();

  const [view, setView] = useState<StudioView>('state');
  const [action, setAction] = useState(0x00);
  const [scale, setScale] = useState(3);
  const [busy, setBusy] = useState(false);

  const sheet = draft.draft?.sheet ?? null;
  const state = useMemo(() => stateFor(action), [action]);
  const row = useMemo(() => (sheet ? resolvePalette(sheet, wearing.wearing) : null), [sheet, wearing.wearing]);

  // Selecting the bunny art without its own palette reads as a bug rather than a choice,
  // so picking that state moves the outfit with it.
  useEffect(() => {
    if (action === 0x21) wearing.setOutfit('bunny');
  }, [action, wearing]);

  const run = useCallback(async (task: () => Promise<unknown>) => {
    setBusy(true);
    try { await task(); } finally { setBusy(false); }
  }, []);

  const handleUrlImport = useCallback(async (url: string) => {
    const bytes = await fetchToBytes(url);
    const name = decodeURIComponent(url.split('/').pop() || 'sprite.zspr');
    return library.importBytes(name, bytes);
  }, [library]);

  const handleDelete = useCallback((name: string) => {
    onDeleteConfirm('Delete player sprite', `Delete "${name}"? This cannot be undone.`, async () => {
      if (draft.draft?.file === name) draft.close();
      await library.remove(name);
    });
  }, [onDeleteConfirm, draft, library]);

  const list = (
    <SpriteLibraryList
      entries={library.entries}
      selected={draft.draft?.file ?? null}
      canCreate={!!romWithAssets}
      onSelect={(name) => run(() => draft.open(name))}
      onCreate={() => run(draft.createNew)}
      onDelete={handleDelete}
      onUrlImport={handleUrlImport}
      onFileImport={library.importFiles}
    />
  );

  const detail = !sheet || !row ? (
    <Text>Select a sprite to open it, or create one from the stock sheet.</Text>
  ) : (
    <Box className="sprite-studio">
      <StudioToolbar
        meta={sheet.meta}
        file={draft.draft?.file ?? null}
        dirty={draft.dirty}
        applied={draft.applied}
        busy={busy}
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

      <WearingBar
        outfit={wearing.outfit}
        gloves={wearing.gloves}
        onOutfit={wearing.setOutfit}
        onGloves={wearing.setGloves}
      />

      <Box className="sprite-studio__controls">
        <SegmentedControl value={view} options={VIEW_OPTIONS} onChange={(v) => setView(v as StudioView)} />
        <Button variant="ghost" size="sm" onClick={() => clock.setPlaying(!clock.playing)}>
          {clock.playing ? 'Pause' : 'Play'}
        </Button>
        <Button variant="ghost" size="sm" onClick={clock.stepOnce}>Step</Button>
        <Text className="sprite-studio__control-label">{clock.fps} fps</Text>
        <RangeInput
          min={clock.MIN_FPS}
          max={clock.MAX_FPS}
          value={clock.fps}
          onChange={(e) => clock.setFps(Number(e.target.value))}
        />
        <Text className="sprite-studio__control-label">Zoom {scale}x</Text>
        <RangeInput
          min={MIN_SCALE}
          max={MAX_SCALE}
          value={scale}
          onChange={(e) => setScale(Number(e.target.value))}
        />
      </Box>

      <Box className="sprite-studio__body">
        {view === 'state' && <StateList selected={action} onSelect={setAction} />}
        <Box className="sprite-studio__stage">
          {view === 'state' && state && (
            <StatePreview sheet={sheet} row={row} state={state} tick={clock.tick} scale={scale} />
          )}
          {view === 'contact' && (
            <ContactSheet
              sheet={sheet}
              row={row}
              tick={clock.tick}
              scale={scale}
              onSelect={(next) => { setAction(next); setView('state'); }}
            />
          )}
          {view === 'sheet' && <SheetBrowser sheet={sheet} wearing={wearing.wearing} scale={scale} />}
        </Box>

        <PaletteEditor
          sheet={sheet}
          outfit={wearing.outfit}
          onColor={(index, word) => draft.setColor(wearing.outfit, index, word)}
          onGloveColor={draft.setGloveColor}
          onReset={(index) => draft.resetColor(wearing.outfit, index)}
        />
      </Box>
    </Box>
  );

  return <MasterDetailLayout className="sprite-studio-layout" list={list} detail={detail} detailEmpty={!sheet} />;
};

export { PlayerSpriteStudio };
