/* @layer renderer-components @kind component */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Select } from '../../../primitives/Select';
import { Button } from '../../../primitives/Button';
import { Field } from '../../../primitives/Field';
import { ButtonRow } from '../../../primitives/ButtonRow';
import { MasterDetailLayout } from '../../../composites/MasterDetailLayout';
import { ListItemRow } from '../../../composites/ListItemRow';
import {
  SPRITE_MANIFEST,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type SpriteCategory,
} from '@shared/game/sprites';
import './SpriteManager.css';

interface SpriteManagerProps {
  romStatuses: RomDisplayInfo[];
}

const SpriteManager = (props: SpriteManagerProps) => {
  const { romStatuses } = props;
  const [selectedRom, setSelectedRom] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [status, setStatus] = useState<{ extracted: boolean; count: number }>({ extracted: false, count: 0 });
  const [catFilter, setCatFilter] = useState<'all' | SpriteCategory>('all');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const refresh = useCallback(async () => {
    if (!selectedRom) {
      setStatus({ extracted: false, count: 0 });
      return;
    }
    const s = await window.api.checkSpritesExtracted(selectedRom);
    setStatus(s);
  }, [selectedRom]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleExtract = useCallback(async () => {
    if (!selectedRom) return;
    setExtracting(true);
    setMessage(null);
    const result = await window.api.extractSprites(selectedRom);
    setExtracting(false);
    if (result.success) {
      setMessage({ type: 'success', text: `Extracted ${result.count ?? 0} sprites` });
      await refresh();
    } else {
      setMessage({ type: 'error', text: result.error ?? 'Extraction failed' });
    }
  }, [selectedRom, refresh]);

  const handleDelete = useCallback(async () => {
    if (!selectedRom) return;
    setDeleting(true);
    setMessage(null);
    const result = await window.api.deleteSprites(selectedRom);
    setDeleting(false);
    if (result.success) {
      setMessage({ type: 'success', text: 'Sprites deleted' });
      await refresh();
    } else {
      setMessage({ type: 'error', text: result.error ?? 'Delete failed' });
    }
  }, [selectedRom, refresh]);

  const romsWithAssets = useMemo(
    () => romStatuses.filter(r => r.hasAssets),
    [romStatuses]
  );

  const spriteBaseUrl = useMemo(
    () => selectedRom ? window.api.getSpritesBaseUrl(selectedRom) : '',
    [selectedRom]
  );

  const filtered = useMemo(
    () => SPRITE_MANIFEST.filter(s => catFilter === 'all' || s.category === catFilter),
    [catFilter]
  );

  const catCounts = useMemo(() => {
    const cc: Record<string, number> = { all: SPRITE_MANIFEST.length };
    for (const cat of CATEGORY_ORDER) cc[cat] = SPRITE_MANIFEST.filter(s => s.category === cat).length;
    return cc;
  }, []);

  const list = (
    <>
      {/* Extraction form */}
      <div className="import-form">
        <Field label="ROM Source">
          <Select
            value={selectedRom}
            onChange={setSelectedRom}
            options={[
              { value: '', label: 'Select a ROM…' },
              ...romsWithAssets.map(r => ({ value: r.romFile, label: r.romFile })),
            ]}
            placeholder="Select a ROM…"
          />
        </Field>
        <ButtonRow align="start">
          <Button variant="primary" size="sm" onClick={handleExtract} disabled={!selectedRom || extracting || deleting}>
            {extracting ? '⟳ Extracting…' : '🖼️ Extract Sprites'}
          </Button>
          {status.extracted && (
            <Button variant="danger" size="sm" onClick={handleDelete} disabled={!selectedRom || extracting || deleting}>
              {deleting ? '⟳ Deleting…' : '🗑️ Delete Sprites'}
            </Button>
          )}
        </ButtonRow>
        {message && (
          <div className={`sprite-manager__message sprite-manager__message--${message.type}`}>
            {message.text}
          </div>
        )}
      </div>

      {/* Status */}
      <div className="data-list">
        <ListItemRow
          icon="🖼️"
          selected={status.extracted}
          name={status.extracted ? 'Sprites Extracted' : 'No Sprites'}
          meta={
            status.extracted
              ? `${status.count} sprite images for ${selectedRom}`
              : selectedRom
                ? 'Extract from this ROM to use in tracker'
                : 'Select a ROM first'
          }
        />
      </div>
    </>
  );

  const detail = !status.extracted ? (
    <span>{selectedRom ? 'Extract sprites from this ROM to view them here' : 'Select a ROM first'}</span>
  ) : (
    <div className="sprite-manager__panel">
            {/* Category filter */}
            <div className="sprite-manager__filters">
              <CatButton label="All" value="all" current={catFilter} onClick={setCatFilter} count={catCounts.all} />
              {CATEGORY_ORDER.map(c => (
                <CatButton key={c} label={CATEGORY_LABELS[c]} value={c} current={catFilter} onClick={setCatFilter} count={catCounts[c]} />
              ))}
            </div>

            {/* Sprite grid */}
            <div className="sprite-manager__grid">
              {filtered.map(sprite => (
                <SpriteCard key={sprite.file} file={sprite.file} label={sprite.label} category={sprite.category} baseUrl={spriteBaseUrl} />
              ))}
            </div>
    </div>
  );

  return <MasterDetailLayout list={list} detail={detail} detailEmpty={!status.extracted} />;
};

const CatButton = ({ label, value, current, onClick, count }: {
  label: string;
  value: string;
  current: string;
  onClick: (v: any) => void;
  count: number;
}) => {
  return (
    <button
      className={`sprite-manager__cat-btn ${current === value ? 'sprite-manager__cat-btn--active' : ''}`}
      onClick={() => onClick(value)}
    >
      {label} <span className="sprite-manager__cat-count">{count}</span>
    </button>
  );
};

const SpriteCard = ({ file, label, category, baseUrl }: { file: string; label: string; category: SpriteCategory; baseUrl: string }) => {
  return (
    <div className="sprite-card">
      <img
        className="sprite-card__img"
        src={`${baseUrl}${file}.png`}
        alt={label}
        draggable={false}
      />
      <div className="sprite-card__info">
        <span className="sprite-card__label">{label}</span>
        <span className="sprite-card__category">{CATEGORY_LABELS[category]}</span>
      </div>
    </div>
  );
};

export { SpriteManager };
export type { SpriteManagerProps };
