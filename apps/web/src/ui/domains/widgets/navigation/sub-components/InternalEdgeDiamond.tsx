/* @layer renderer-widgets @kind component */
import type { ConnectionInfo, ScreenBundle } from '@shared/game/navigation';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { S } from '../styles';
import { InternalEdgeSvg } from './InternalEdgeSvg';
import { ReqIcon } from './ReqIcon';
import { REQ_ROW } from './InternalEdgeDiamond.constants';
import type { DiamondPos } from './InternalEdgeDiamond.type';

const getEdgeDiamondPos = (conn: ConnectionInfo, bundle: ScreenBundle): DiamondPos => {
  const idx = bundle.screens.indexOf(conn.sourceScreen!);
  const col = idx % bundle.cols;
  const row = Math.floor(idx / bundle.cols);
  if (conn.edge === 'east') {
    return row === 0 ? 'top' : 'bottom';
  }
  return col === 0 ? 'left' : 'right';
};

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
        <Text style={{ fontSize: 8, color: conn.layerToggle ? 'var(--c-info)' : 'var(--c-secondary)', marginTop: 2 }}>
          {conn.layerToggle ? '▲▼ Toggle' : '═ Same'}
        </Text>
        {conn.requirements.length > 0 && (
          <Box style={REQ_ROW}>{conn.requirements.map(r => <ReqIcon key={r} req={r} />)}</Box>
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
