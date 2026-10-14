/* @layer renderer-widgets @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { ReqIcon } from './ReqIcon';
import { EdgeCardHeader } from './EdgeCardHeader';
import { EdgeLayerRow } from './EdgeLayerRow';
import type { EdgeCardProps } from './EdgeCard.type';
import './EdgeCard.css';

const EdgeCard = ({ row, screenBundle, isIndoors, playerLayer }: EdgeCardProps) => {
  const { crossing } = row;
  return (
    <Box className={crossing.available ? 'nav-conn-card' : 'nav-conn-card nav-edge-card--blocked'} title={crossing.arrival ?? crossing.id}>
      <EdgeCardHeader row={row} screenBundle={screenBundle} />
      {isIndoors && <EdgeLayerRow toggles={crossing.layerToggle === true} playerLayer={playerLayer} />}
      {crossing.requirements.length > 0 && (
        <Box className="nav-meta">{crossing.requirements.map(req => <ReqIcon key={req} req={req} />)}</Box>
      )}
    </Box>
  );
};

export { EdgeCard };
