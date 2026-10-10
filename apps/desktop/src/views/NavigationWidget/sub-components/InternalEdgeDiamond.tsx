/* @layer renderer-widgets @kind component */
import type { ConnectionInfo } from '@rotp/game-core';
import type { ScreenBundleGrid } from '@rotp/game-data';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { InternalEdgeSvg } from './InternalEdgeSvg';
import { ReqIcon } from './ReqIcon';
import type { DiamondPos } from './InternalEdgeDiamond.type';
import { sourceSubName } from '../behavior/source-sub-name';
import './InternalEdgeDiamond.css';

const getEdgeDiamondPos = (conn: ConnectionInfo, bundle: ScreenBundleGrid): DiamondPos => {
  const idx = conn.sourceScreen === undefined ? -1 : bundle.screens.indexOf(conn.sourceScreen);
  const col = idx % bundle.cols;
  const row = Math.floor(idx / bundle.cols);
  if (conn.edge === 'east') {
    return row === 0 ? 'top' : 'bottom';
  }
  return col === 0 ? 'left' : 'right';
};

const InternalEdgeDiamond = ({ connections, screenBundle }: { connections: ConnectionInfo[]; screenBundle: ScreenBundleGrid }) => {
  const slots: Record<DiamondPos, ConnectionInfo | null> = { top: null, bottom: null, left: null, right: null };
  for (const conn of connections) {
    slots[getEdgeDiamondPos(conn, screenBundle)] = conn;
  }

  const renderCard = (conn: ConnectionInfo | null) => {
    if (!conn) return <Box className="nav-internal-edge-diamond__card" />;
    const fromName = sourceSubName(conn, screenBundle);
    const toName = screenBundle.subNames[conn.targetScreen] ?? '?';
    return (
      <Box className="nav-card">
        <Box className="nav-card-graphic">
          <InternalEdgeSvg edge={conn.edge} fromName={fromName} toName={toName} />
        </Box>
        <Text className="nav-card-sub">{conn.freeTileCount}{conn.itemTileCount > 0 ? `+${conn.itemTileCount}` : ''}</Text>
        <Text className={conn.layerToggle ? 'nav-internal-edge-diamond__layer nav-val-info' : 'nav-internal-edge-diamond__layer nav-val-green'}>
          {conn.layerToggle ? '▲▼ Toggle' : '═ Same'}
        </Text>
        {conn.requirements.length > 0 && (
          <Box className="nav-internal-edge-diamond__req-row">{conn.requirements.map(r => <ReqIcon key={r} req={r} />)}</Box>
        )}
      </Box>
    );
  };

  return (
    <Box className="nav-diamond">
      {(slots.top) && <Box className="nav-diamond-row">{renderCard(slots.top)}</Box>}
      <Box className="nav-diamond-mid">
        {renderCard(slots.left)}
        {renderCard(slots.right)}
      </Box>
      {(slots.bottom) && <Box className="nav-diamond-row">{renderCard(slots.bottom)}</Box>}
    </Box>
  );
};

export { InternalEdgeDiamond };
