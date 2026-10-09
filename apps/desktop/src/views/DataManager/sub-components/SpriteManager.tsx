/* @layer renderer-components @kind component */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Select, Button, Field, ButtonRow, EmptyState, IconButton, Stack } from '@drizztdourden08/tessera/primitives';
import { ListDetailLayout, ListItemRow } from '@drizztdourden08/tessera/composites';
import { SpriteGrid } from './SpriteGrid';
import { ImportProgress } from './ImportProgress';
import { useImportProgress } from '@app/hooks/useImportProgress';
import * as spritesStore from '@app/storage/sprites-store';
import { useSpriteAvailabilityStore } from '@app/stores/sprite-availability-store';
import type { ExtractedStatus, SpriteManagerProps } from './SpriteManager.type';
import './SpriteManager.css';

const SpriteManager = (props: SpriteManagerProps) => {
  const { romStatuses } = props;
  const [extractedMap, setExtractedMap] = useState<Record<string, ExtractedStatus>>({});
  const [selectedRom, setSelectedRom] = useState('');
  const [toExtract, setToExtract] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const progress = useImportProgress('sprite');

  const romsWithAssets = useMemo(() => romStatuses.filter(r => r.hasAssets), [romStatuses]);

  const refreshExtracted = useCallback(async () => {
    const entries = await Promise.all(
      romsWithAssets.map(async (r) => [r.romFile, await spritesStore.checkSpritesExtracted(r.romFile)] as const)
    );
    setExtractedMap(Object.fromEntries(entries));
  }, [romsWithAssets]);

  const spritesAvailable = useSpriteAvailabilityStore((s) => s.available);
  useEffect(() => { refreshExtracted(); }, [refreshExtracted, spritesAvailable]);

  const importedRoms = useMemo(
    () => romsWithAssets.filter(r => extractedMap[r.romFile]?.extracted),
    [romsWithAssets, extractedMap]
  );
  const availableRoms = useMemo(
    () => romsWithAssets.filter(r => !extractedMap[r.romFile]?.extracted),
    [romsWithAssets, extractedMap]
  );

  useEffect(() => {
    if (importedRoms.length === 0) { setSelectedRom(''); return; }
    if (!importedRoms.some(r => r.romFile === selectedRom)) setSelectedRom(importedRoms[0].romFile);
  }, [importedRoms, selectedRom]);

  const [spriteBaseUrl, setSpriteBaseUrl] = useState('');
  useEffect(() => {
    if (!selectedRom) { setSpriteBaseUrl(''); return; }
    let cancelled = false;
    spritesStore.getSpritesBaseUrl(selectedRom).then((u) => { if (!cancelled) setSpriteBaseUrl(u); });
    return () => { cancelled = true; };
  }, [selectedRom]);

  const handleExtract = useCallback(async () => {
    if (!toExtract) return;
    setBusy(true); setMessage(null);
    const result = await spritesStore.extractSprites(toExtract);
    setBusy(false);
    if (result.success) {
      setMessage({ type: 'success', text: `Extracted ${result.count ?? 0} sprites` });
      await refreshExtracted();
      setSelectedRom(toExtract);
      setToExtract('');
    } else {
      setMessage({ type: 'error', text: result.error ?? 'Extraction failed' });
    }
  }, [toExtract, refreshExtracted]);

  const handleDelete = useCallback(async (romFile: string) => {
    setBusy(true); setMessage(null);
    const result = await spritesStore.deleteSprites(romFile);
    setBusy(false);
    if (result.success) {
      await refreshExtracted();
    } else {
      setMessage({ type: 'error', text: result.error ?? 'Delete failed' });
    }
  }, [refreshExtracted]);

  const emptyDropdownMessage = romsWithAssets.length === 0
    ? 'No ROMs available. Import a ROM first.'
    : 'All imported ROMs have sprites';

  const list = (
    <>
      <Box className="import-form">
        <Field label="Add sprites from ROM">
          {availableRoms.length > 0 ? (
            <Select
              value={toExtract}
              onChange={setToExtract}
              options={[{ value: '', label: 'Select a ROM...' }, ...availableRoms.map(r => ({ value: r.romFile, label: r.romFile }))]}
              placeholder="Select a ROM..."
            />
          ) : (
            <EmptyState message={emptyDropdownMessage} />
          )}
        </Field>
        {availableRoms.length > 0 && (
          <ButtonRow align="start">
            <Button variant="primary" size="sm" onClick={handleExtract} disabled={!toExtract || busy}>
              {busy ? '⟳ Working...' : '🖼️ Extract Sprites'}
            </Button>
          </ButtonRow>
        )}
        {busy && <ImportProgress state={progress} fallbackLabel="Extracting sprites..." />}
        {message && (
          <Box className={`sprite-manager__message sprite-manager__message--${message.type}`}>{message.text}</Box>
        )}
      </Box>

      <Stack gap="xs">
        {importedRoms.length === 0 && <EmptyState message="No sprites extracted yet" />}
        {importedRoms.map((r) => (
          <ListItemRow
            key={r.romFile}
            icon="🖼️"
            name={r.romFile}
            selected={selectedRom === r.romFile}
            onClick={() => setSelectedRom(r.romFile)}
            meta={`${extractedMap[r.romFile]?.count ?? 0} sprite images`}
            action={
              <IconButton variant="ghost" size="sm" label="Delete" onClick={(e) => { e.stopPropagation(); handleDelete(r.romFile); }}>
                ✕
              </IconButton>
            }
          />
        ))}
      </Stack>
    </>
  );

  return (
    <ListDetailLayout
      list={list}
      detail={selectedRom ? <SpriteGrid baseUrl={spriteBaseUrl} /> : null}
      emptyDetail={<EmptyState message="Select an imported ROM to view its sprites" />}
    />
  );
};

export { SpriteManager };
