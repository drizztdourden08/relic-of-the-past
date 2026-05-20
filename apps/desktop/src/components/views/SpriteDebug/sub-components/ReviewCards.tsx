import type { ReviewEntry, ReviewStatus } from '../types';
import type { SpriteManifestEntry } from '@shared/game/sprites';
import { StatusBtns } from './ReviewControls';
import { S } from '../styles';

function SpriteImageCard({ sprite, entry, baseUrl, onSetStatus, onSetComment }: {
  sprite: SpriteManifestEntry; entry: ReviewEntry; baseUrl: string;
  onSetStatus: (s: ReviewStatus) => void; onSetComment: (c: string) => void;
}) {
  const border = entry.status === 'good' ? '#4caf50' : entry.status === 'bad' ? '#f44336' : entry.status === 'yellow' ? '#f5c542' : 'rgba(255,255,255,0.08)';
  const bg = entry.status === 'good' ? 'rgba(76,175,80,0.06)' : entry.status === 'bad' ? 'rgba(244,67,54,0.06)' : entry.status === 'yellow' ? 'rgba(245,197,66,0.06)' : 'rgba(255,255,255,0.02)';
  const catColor = sprite.category === 'hud' || sprite.category === 'hud-pause' || sprite.category === 'hud-item' ? '#8bb4e0' : sprite.category === 'fonts' ? '#b89de0' : sprite.category === 'receipt' ? '#c4a862' : '#82c487';

  return (
    <div style={{ ...S.card, borderColor: border, background: bg }}>
      <div style={S.cardTop}>
        <div style={S.spriteWrap}>
          <img src={`${baseUrl}${sprite.file}.png`} alt={sprite.label} style={S.sprite} draggable={false}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
        <div style={S.cardInfo}>
          <span style={S.itemName}>{sprite.label}</span>
          <span style={S.fileName}>{sprite.file}.png</span>
          <span style={{ fontSize: 9, color: catColor }}>{sprite.category}</span>
        </div>
        <StatusBtns current={entry.status} onClick={onSetStatus} />
      </div>
      {(entry.status === 'bad' || entry.status === 'yellow') && (
        <input style={S.commentInput} placeholder="What's wrong with this sprite?"
          value={entry.comment ?? ''} onChange={e => onSetComment(e.target.value)}
          onClick={e => e.stopPropagation()} />
      )}
    </div>
  );
}

function ItemAssocCard({ item, entry, baseUrl, onSetStatus, onSetComment }: {
  item: { name: string; file: string }; entry: ReviewEntry; baseUrl: string;
  onSetStatus: (s: ReviewStatus) => void; onSetComment: (c: string) => void;
}) {
  const border = entry.status === 'good' ? '#4caf50' : entry.status === 'bad' ? '#f44336' : entry.status === 'yellow' ? '#f5c542' : 'rgba(255,255,255,0.08)';
  const bg = entry.status === 'good' ? 'rgba(76,175,80,0.06)' : entry.status === 'bad' ? 'rgba(244,67,54,0.06)' : entry.status === 'yellow' ? 'rgba(245,197,66,0.06)' : 'rgba(255,255,255,0.02)';

  return (
    <div style={{ ...S.card, borderColor: border, background: bg }}>
      <div style={S.cardTop}>
        <div style={S.spriteWrap}>
          {item.file ? (
            <img src={`${baseUrl}${item.file}.png`} alt={item.name} style={S.sprite} draggable={false}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <span style={{ fontSize: 9, color: '#555' }}>none</span>
          )}
        </div>
        <div style={S.cardInfo}>
          <span style={S.itemName}>{item.name}</span>
          <span style={S.fileName}>{item.file ? `${item.file}.png` : '(no sprite)'}</span>
        </div>
        <StatusBtns current={entry.status} onClick={onSetStatus} />
      </div>
      {(entry.status === 'bad' || entry.status === 'yellow') && (
        <input style={S.commentInput} placeholder="Which sprite should this item use?"
          value={entry.comment ?? ''} onChange={e => onSetComment(e.target.value)}
          onClick={e => e.stopPropagation()} />
      )}
    </div>
  );
}

export { ItemAssocCard, SpriteImageCard };
