/* @layer renderer-widgets @kind component */
import type { ConnectionInfo, ScreenBundle } from '@shared/game/navigation';
import { Box, Text } from '../../../../design-system/primitives';
import { S } from '../styles';
import { InternalEdgeSvg } from './InternalEdgeSvg';
import { ReqIcon } from './ReqIcon';

type DiamondPos = 'top' | 'bottom' | 'left' | 'right';

const getEdgeDiamondPos = (conn: ConnectionInfo, bundle: ScreenBundle): DiamondPos => {
  const idx = bundle.screens.indexOf(conn.sourceScreen!);
  const col = idx % bundle.cols;
  const row = Math.floor(idx / bundle.cols);
  if (conn.edge === 'east') {
    return row === 0 ? 'top' : 'bottom';
  }
  return col === 0 ? 'left' : 'right';
};

/** 4-slot diamond layout of internal-edge connection cards around a room. */
const InternalEdgeDiamond = ({ connections, screenBundle }: { connections: ConnectionInfo[]; screenBundle: ScreenBundle }) => {
  const slots: Record<DiamondPos, ConnectionInfo | null> = { top: null, bottom: null, left: null, right: null };
  for (const conn of connections) {
    slots[getEdgeDiamondPos(conn, screenBundle)] = conn;
  }

  const renderCard = (conn: ConnectionInfo | null) => {
    if (!conn) return <Box style={{ ...S.card, visibility: 'hidden' }} />;
    const fromName = screenBundle.subNames[conn.sourceScreen!] ?? '?';
    const toName = screenBundle.subNames[conn.targetScreen] ?? '?';
    return (
      <Box style={S.card}>
        <Box style={S.cardGraphic}>
          <InternalEdgeSvg edge={conn.edge} fromName={fromName} toName={toName} />
        </Box>
        <Text style={S.cardSub}>{conn.freeTileCount}{conn.itemTileCount > 0 ? `+${conn.itemTileCount}` : ''}</Text>
        <Text style={{ fontSize: 8, color: conn.layerToggle ? '#f8a' : '#6a8', marginTop: 2 }}>
          {conn.layerToggle ? '▲▼ Toggle' : '═ Same'}
        </Text>
        {conn.requirements.length > 0 && (
          <Box style={{ display: 'flex', gap: 2, marginTop: 2 }}>{conn.requirements.map(r => <ReqIcon key={r} req={r} />)}</Box>
        )}
      </Box>
    );
  };

  return (
    <Box style={S.diamond}>
      {(slots.top) && <Box style={S.diamondRow}>{renderCard(slots.top)}</Box>}
      <Box style={S.diamondMid}>
        {renderCard(slots.left)}
        {renderCard(slots.right)}
      </Box>
      {(slots.bottom) && <Box style={S.diamondRow}>{renderCard(slots.bottom)}</Box>}
    </Box>
  );
};

export { InternalEdgeDiamond };
